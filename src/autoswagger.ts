import YAML from 'json-to-pretty-yaml'
import fs from 'fs'
import path from 'path'
import util from 'util'
import { status } from 'http-status'
import { uniq, isEmpty, isUndefined } from 'lodash'
import { access } from 'node:fs/promises'
import { serializeMiddleware, serializeHandler } from './adonishelpers.js'
import {
  InterfaceParser,
  ModelParser,
  CommentParser,
  RouteParser,
  ValidatorParser,
} from './parsers.js'
import elysiajs from './css/elysiajs.js'
import type { options, AdonisRoutes, Handler, AdonisRoute } from './types.js'
import { mergeParams, formatOperationId } from './helpers.js'
import ExampleGenerator, { ExampleInterfaces } from './example.js'
import { VineValidator } from '@vinejs/vine'

export class AutoSwagger {
  private options: options
  private schemas = {}
  private commentParser: CommentParser
  private modelParser: ModelParser
  private interfaceParser: InterfaceParser
  private routeParser: RouteParser
  private validatorParser: ValidatorParser
  private customPaths = {}

  ui(url: string, options?: options) {
    const persistAuthString = options?.persistAuthorization
      ? 'persistAuthorization: true,'
      : ''
    return `<!DOCTYPE html>
		<html lang="en">
		<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<meta http-equiv="X-UA-Compatible" content="ie=edge">
				<script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.3/swagger-ui-standalone-preset.js"></script>
				<script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.3/swagger-ui-bundle.js"></script>
				<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.3/swagger-ui.css" />
				<title>Documentation</title>
		</head>
		<body>
				<div id="swagger-ui"></div>
				<script>
						window.onload = function() {
							SwaggerUIBundle({
								url: "${url}",
								dom_id: '#swagger-ui',
								presets: [
									SwaggerUIBundle.presets.apis,
									SwaggerUIStandalonePreset
								],
								layout: "BaseLayout",
                ${persistAuthString}
							})
						}
				</script>
		</body>
		</html>`
  }

  scalar(url: string) {
    return `
      <!doctype html>
      <html>
        <head>
          <title>API Reference</title>
          <meta charset="utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1" />
          <style>
            body {
              margin: 0;
            }
          </style>
          <style>
            ${elysiajs}
          </style>
        </head>
        <body>
          <script
            id="api-reference"
            data-url="${url}">
          </script>
          <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
        </body>
      </html>
    `
  }

  jsonToYaml(json: any) {
    return YAML.stringify(json)
  }

  async json(routes: any, options: options) {
    if (process.env.NODE_ENV === 'production') {
      return this.readFile(options.path, 'json')
    }
    return await this.generate(routes, options)
  }

  async writeFile(routes: any, options: options) {
    const json = await this.generate(routes, options)
    const contents = this.jsonToYaml(json)
    const filePath = options.path + 'swagger.yml'
    const filePathJson = options.path + 'swagger.json'

    fs.writeFileSync(filePath, contents)
    fs.writeFileSync(filePathJson, JSON.stringify(json, null, 2))
  }

  private async readFile(rootPath, type = 'yml') {
    const filePath = rootPath + 'swagger.' + type
    const data = fs.readFileSync(filePath, 'utf-8')
    if (!data) {
      console.error('Error reading file')
      return
    }
    return data
  }

  async docs(routes: any, options: options) {
    if (process.env.NODE_ENV === 'production') {
      return this.readFile(options.path)
    }
    return this.jsonToYaml(await this.generate(routes, options))
  }

  private async generate(adonisRoutes: AdonisRoutes, options: options) {
    this.options = {
      ...{
        snakeCase: true,
        preferredPutPatch: 'PUT',
        debug: false,
      },
      ...options,
    }

    const routes = adonisRoutes.root
    this.options.appPath = this.options.path + 'app'

    try {
      const pj = fs.readFileSync(path.join(this.options.path, 'package.json'))

      const pjson = JSON.parse(pj.toString())
      if (pjson.imports) {
        Object.entries(pjson.imports).forEach(([key, value]) => {
          const k = (key as string).replaceAll('/*', '')
          this.customPaths[k] = (value as string)
            .replaceAll('/*.js', '')
            .replaceAll('./', '')
        })
      }
    } catch (e) {
      console.error(e)
    }

    this.commentParser = new CommentParser(this.options)
    this.routeParser = new RouteParser(this.options)
    this.modelParser = new ModelParser(this.options.snakeCase)
    this.interfaceParser = new InterfaceParser(this.options.snakeCase)
    this.validatorParser = new ValidatorParser()
    this.schemas = await this.getSchemas()
    if (this.options.debug) {
      console.log(this.options)
      console.log('Found Schemas', Object.keys(this.schemas))
      console.log('Using custom paths', this.customPaths)
    }
    this.commentParser.exampleGenerator = new ExampleGenerator(this.schemas)

    const docs = {
      openapi: '3.0.0',
      info: options.info || {
        title: options.title,
        version: options.version,
        description:
          options.description ||
          'Generated by AdonisJS AutoSwagger https://github.com/retronew/adonis-autoswagger',
      },

      components: {
        responses: {
          Forbidden: {
            description: 'Access token is missing or invalid',
          },
          Accepted: {
            description: 'The request was accepted',
          },
          Created: {
            description: 'The resource has been created',
          },
          NotFound: {
            description: 'The resource has been created',
          },
          NotAcceptable: {
            description: 'The resource has been created',
          },
        },
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
          },
          BasicAuth: {
            type: 'http',
            scheme: 'basic',
          },
          ApiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key',
          },
          ...this.options.securitySchemes,
        },
        schemas: this.schemas,
      },
      paths: {},
      tags: [],
    }
    let paths = {}

    let sscheme = 'BearerAuth'
    if (this.options.defaultSecurityScheme) {
      sscheme = this.options.defaultSecurityScheme
    }

    let securities = {
      'auth': { [sscheme]: ['access'] },
      'auth:api': { [sscheme]: ['access'] },
      ...this.options.authMiddlewares
        ?.map((am) => ({
          [am]: { [sscheme]: ['access'] },
        }))
        .reduce((acc, val) => ({ ...acc, ...val }), {}),
    }

    let globalTags = []

    if (this.options.debug) {
      console.log('Route annotations:')
      console.log('-----')
    }

    for await (const route of routes) {
      let ignore = false
      for (const i of options.ignore) {
        if (
          route.pattern == i ||
          (i.endsWith('*') && route.pattern.startsWith(i.slice(0, -1))) ||
          (i.startsWith('*') && route.pattern.endsWith(i.slice(1)))
        ) {
          ignore = true
          break
        }
      }
      if (ignore) continue

      let security = []
      const responseCodes = {
        GET: '200',
        POST: '201',
        DELETE: '202',
        PUT: '204',
      }

      if (!Array.isArray(route.middleware)) {
        route.middleware = serializeMiddleware(route.middleware) as string[]
      }

      ;(route.middleware as string[]).forEach((m) => {
        if (typeof securities[m] !== 'undefined') {
          security.push(securities[m])
        }
      })

      let { tags, parameters, pattern } = this.routeParser.extractInfos(
        route.pattern
      )

      tags.forEach((tag) => {
        if (globalTags.filter((e) => e.name === tag).length > 0) return
        if (tag === '') return
        globalTags.push({
          name: tag,
          description: 'Everything related to ' + tag,
        })
      })

      const { sourceFile, action, customAnnotations, operationId } =
        await this.getDataBasedOnAdonisVersion(route)

      route.methods.forEach((method) => {
        let responses = {}
        if (method === 'HEAD') return

        if (
          route.methods.includes('PUT') &&
          route.methods.includes('PATCH') &&
          method !== this.options.preferredPutPatch
        )
          return

        let description = ''
        let summary = ''
        let tag = ''
        let operationId: string

        if (security.length > 0) {
          responses['401'] = {
            description: `Returns **401** (${status[401]})`,
          }
          responses['403'] = {
            description: `Returns **403** (${status[403]})`,
          }
        }

        let requestBody = {
          content: {
            'application/json': {},
          },
        }

        let actionParams = {}

        if (action !== '' && typeof customAnnotations[action] !== 'undefined') {
          description = customAnnotations[action].description
          summary = customAnnotations[action].summary
          operationId = customAnnotations[action].operationId
          responses = { ...responses, ...customAnnotations[action].responses }
          requestBody = customAnnotations[action].requestBody
          actionParams = customAnnotations[action].parameters
          tag = customAnnotations[action].tag
        }
        parameters = mergeParams(parameters, actionParams)

        if (tag != '') {
          globalTags.push({
            name: tag.toUpperCase(),
            description: 'Everything related to ' + tag.toUpperCase(),
          })
          tags = [tag.toUpperCase()]
        }

        if (isEmpty(responses)) {
          responses[responseCodes[method]] = {
            description: status?.[responseCodes[method]] ?? '',
            content: {
              'application/json': {},
            },
          }
        } else {
          if (
            typeof responses[responseCodes[method]] !== 'undefined' &&
            typeof responses[responseCodes[method]]['summary'] !== 'undefined'
          ) {
            if (summary === '') {
              summary = responses[responseCodes[method]]['summary']
            }
            delete responses[responseCodes[method]]['summary']
          }
          if (
            typeof responses[responseCodes[method]] !== 'undefined' &&
            typeof responses[responseCodes[method]]['description'] !==
              'undefined'
          ) {
            description = responses[responseCodes[method]]['description']
          }
        }

        if (action !== '' && summary === '') {
          // Solve toLowerCase undefined exception
          // https://github.com/retronew/adonis-autoswagger/issues/28
          tags[0] = tags[0] ?? ''

          switch (action) {
            case 'index':
              summary = 'Get a list of ' + tags[0].toLowerCase()
              break
            case 'show':
              summary = 'Get a single instance of ' + tags[0].toLowerCase()
              break
            case 'update':
              summary = 'Update ' + tags[0].toLowerCase()
              break
            case 'destroy':
              summary = 'Delete ' + tags[0].toLowerCase()
              break
          }
        }

        const sf = sourceFile.split('/').at(-1).replace('.ts', '')
        let m = {
          summary: `${summary}${action !== '' ? ` (${action})` : 'route'}`,
          description:
            description + '\n\n _' + sourceFile + '_ - **' + action + '**',
          operationId: operationId,
          parameters: parameters,
          tags: tags,
          responses: responses,
          security: security,
        }

        if (method !== 'GET' && method !== 'DELETE') {
          m['requestBody'] = requestBody
        }

        pattern = pattern.slice(1)
        if (pattern === '') {
          pattern = '/'
        }

        paths = {
          ...paths,
          [pattern]: { ...paths[pattern], [method.toLowerCase()]: m },
        }
      })
    }

    // filter unused tags
    const usedTags = uniq(
      Object.entries(paths)
        .map(([p, val]) => Object.entries(val)[0][1].tags)
        .flat()
    )

    docs.tags = globalTags.filter((tag) => usedTags.includes(tag.name))
    docs.paths = paths
    return docs
  }

  private async getDataBasedOnAdonisVersion(route: AdonisRoute) {
    let sourceFile = ''
    let action = ''
    let customAnnotations
    let operationId = ''
    if (
      route.meta.resolvedHandler !== null &&
      route.meta.resolvedHandler !== undefined
    ) {
      if (
        typeof route.meta.resolvedHandler.namespace !== 'undefined' &&
        route.meta.resolvedHandler.method !== 'handle'
      ) {
        sourceFile = route.meta.resolvedHandler.namespace

        action = route.meta.resolvedHandler.method
        // If not defined by an annotation, use the combination of "controllerNameMethodName"
        if (action !== '' && isUndefined(operationId) && route.handler) {
          operationId = formatOperationId(route.handler as string)
        }
      }
    }

    let handler = <Handler>route.handler
    if (
      handler.reference !== null &&
      handler.reference !== undefined &&
      handler.reference !== ''
    ) {
      if (!Array.isArray(handler.reference)) {
        // handles magic strings
        // router.resource('/test', '#controllers/test_controller')
        ;[sourceFile, action] = handler.reference.split('.')
        const split = sourceFile.split('/')

        if (split[0].includes('#')) {
          sourceFile = sourceFile.replaceAll(
            split[0],
            this.customPaths[split[0]]
          )
        } else {
          sourceFile = this.options.appPath + '/controllers/' + sourceFile
        }
        operationId = formatOperationId(handler.reference)
      } else {
        // handles lazy import
        // const TestController = () => import('#controllers/test_controller')
        handler = await serializeHandler(handler)
        action = handler.method
        sourceFile = handler.moduleNameOrPath
        operationId = formatOperationId(sourceFile + '.' + action)
        const split = sourceFile.split('/')
        if (split[0].includes('#')) {
          sourceFile = sourceFile.replaceAll(
            split[0],
            this.customPaths[split[0]]
          )
        } else {
          sourceFile = this.options.appPath + '/' + sourceFile
        }
      }
    }

    if (sourceFile !== '' && action !== '') {
      sourceFile = sourceFile.replace('App/', 'app/') + '.ts'
      sourceFile = sourceFile.replace('.js', '')

      customAnnotations = await this.commentParser.getAnnotations(
        sourceFile,
        action
      )
    }
    if (
      typeof customAnnotations !== 'undefined' &&
      typeof customAnnotations.operationId !== 'undefined' &&
      customAnnotations.operationId !== ''
    ) {
      operationId = customAnnotations.operationId
    }
    if (this.options.debug) {
      console.log(
        typeof customAnnotations !== 'undefined' && !isEmpty(customAnnotations)
          ? '\x1b[32m✓ OK\x1b[0m'
          : '\x1b[31m✗ NO\x1b[0m',
        'file',
        sourceFile || 'routes.ts',
        'pattern',
        route.pattern,
        'action',
        action
      )
    }
    return { sourceFile, action, customAnnotations, operationId }
  }

  private async getSchemas() {
    let schemas = {
      Any: {
        description: 'Any JSON object not defined as schema',
      },
    }

    const modelSchemas = await this.getModels()
    schemas = { ...schemas, ...modelSchemas }

    this.interfaceParser = new InterfaceParser(this.options.snakeCase, schemas)
    const validatorSchemas = await this.getValidators()
    schemas = { ...schemas, ...validatorSchemas }

    if (this.options.debug) {
      console.log('Found Schemas', Object.keys(schemas))
    }

    return schemas
  }

  private async getValidators() {
    const validators = {}
    let p6 = path.join(this.options.appPath, 'validators')

    if (typeof this.customPaths['#validators'] !== 'undefined') {
      // it's v6
      p6 = p6.replaceAll('app/validators', this.customPaths['#validators'])
      p6 = p6.replaceAll('app\\validators', this.customPaths['#validators'])
    }

    try {
      await access(p6)
    } catch (error) {
      if (this.options.debug) {
        console.log("Validators paths don't exist", p6)
      }
      return validators
    }

    const files = await this.getFiles(p6, [])
    if (this.options.debug) {
      console.log('Found validator files', files)
    }

    try {
      for (let file of files) {
        if (/^[a-zA-Z]:/.test(file)) {
          file = 'file:///' + file
        }

        const val = await import(file)
        for (const [key, value] of Object.entries(val)) {
          if (value.constructor.name.includes('VineValidator')) {
            validators[key] = await this.validatorParser.validatorToObject(
              value as VineValidator<any, any>
            )
            validators[key].description = key + ' (Validator)'
          }
        }
      }
    } catch (e) {
      console.log(
        "**You are probably using 'node ace serve --hmr', which is not supported yet. Use 'node ace serve --watch' instead.**"
      )
      console.error(e.message)
    }

    return validators
  }

  private async getModels() {
    const models = {}
    let p = path.join(this.options.appPath, 'Models')
    let p6 = path.join(this.options.appPath, 'models')

    if (typeof this.customPaths['#models'] !== 'undefined') {
      // it's v6
      p6 = p6.replaceAll('app/models', this.customPaths['#models'])
      p6 = p6.replaceAll('app\\models', this.customPaths['#models'])
    }

    let modelPath = p
    try {
      await access(p)
    } catch {
      try {
        await access(p6)
        modelPath = p6
      } catch {
        if (this.options.debug) {
          console.log("Model paths don't exist", p, p6)
        }
        return models
      }
    }
    const files = await this.getFiles(modelPath, [])
    const readFile = util.promisify(fs.readFile)
    if (this.options.debug) {
      console.log('Found model files', files)
    }
    for (let file of files) {
      file = file.replace('.js', '')
      const data = await readFile(file, 'utf8')
      file = file.replace('.ts', '')
      const split = file.split('/')
      let name = split[split.length - 1].replace('.ts', '')
      file = file.replace('app/', '/app/')
      const parsed = this.modelParser.parseModelProperties(data)
      if (parsed.name !== '') {
        name = parsed.name
      }
      let schema = {
        type: 'object',
        required: parsed.required,
        properties: parsed.props,
        description: name + ' (Model)',
      }
      models[name] = schema
    }
    return models
  }

  private async getFiles(dir, files_) {
    const fs = require('fs')
    files_ = files_ || []
    var files = await fs.readdirSync(dir)
    for (let i in files) {
      var name = dir + '/' + files[i]
      if (fs.statSync(name).isDirectory()) {
        await this.getFiles(name, files_)
      } else {
        files_.push(name)
      }
    }
    return files_
  }
}
