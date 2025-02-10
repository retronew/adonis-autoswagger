import { status } from 'http-status'
import { isJSONString, getBetweenBrackets } from './helpers.js'
import extract from 'extract-comments'
import { readFile } from 'node:fs/promises'
import { snakeCase } from 'es-toolkit'
import { get, has, set, unset } from 'es-toolkit/compat'
import ExampleGenerator from './example.js'
import type { options } from './types.js'
import { standardTypes } from './types.js'
import { VineValidator } from '@vinejs/vine'

export class CommentParser {
  private parsedFiles: { [file: string]: string } = {}
  public exampleGenerator: ExampleGenerator

  options: options

  constructor(options: options) {
    this.options = options
  }

  private parseAnnotations(lines: string[]) {
    let summary = ''
    let tag = ''
    let description = ''
    let operationId = ''
    let responses = {}
    let requestBody = {}
    let parameters = {}
    let headers = {}
    let requestQuery = {}

    lines.forEach((line) => {
      if (line.startsWith('@summary')) {
        summary = line.replace('@summary ', '')
      }

      if (line.startsWith('@tag')) {
        tag = line.replace('@tag ', '')
      }

      if (line.startsWith('@description')) {
        description = line.replace('@description ', '')
      }

      if (line.startsWith('@operationId')) {
        operationId = line.replace('@operationId ', '')
      }

      if (line.startsWith('@responseBody')) {
        responses = {
          ...responses,
          ...this.parseResponseBody(line),
        }
      }

      if (line.startsWith('@responseHeader')) {
        const header = this.parseResponseHeader(line)
        if (header === null) {
          console.error('Error with line: ' + line)
          return
        }
        headers[header['status']] = {
          ...headers[header['status']],
          ...header['header'],
        }
      }

      if (line.startsWith('@requestBody')) {
        requestBody = this.parseBody(line, 'requestBody')
      }

      if (line.startsWith('@requestFormDataBody')) {
        const parsedBody = this.parseRequestFormDataBody(line)
        if (parsedBody) {
          requestBody = parsedBody
        }
      }

      if (line.startsWith('@param')) {
        parameters = {
          ...parameters,
          ...this.parseParam(line),
        }
      }

      if (line.startsWith('@requestQuery')) {
        const queryParams = this.parseRequestQuery(line)
        if (queryParams) {
          parameters = {
            ...parameters,
            ...queryParams
          }
        }
      }
    })

    for (const [key, _value] of Object.entries(responses)) {
      if (typeof headers[key] !== undefined) {
        responses[key]['headers'] = headers[key]
      }
    }

    return {
      description,
      responses,
      requestBody,
      parameters,
      summary,
      operationId,
      tag,
    }
  }

  private parseParam(line: string) {
    const defaultParam = {
      parameterLocation: 'path',
      isRequired: false,
      dataType: 'string',
      exampleValue: null,
      enumValues: [],
    }

    if (line.startsWith('@paramUse')) {
      const usePattern = getBetweenBrackets(line, 'paramUse')
      const usedParameters = usePattern.split(',')
      const resolvedParameters = []

      usedParameters.forEach((paramName) => {
        const commonParam = this.options.common.parameters[paramName]
        if (commonParam) {
          resolvedParameters.push(...commonParam)
        }
      })

      return resolvedParameters
    }

    const locationMatch = line.match('@param([a-zA-Z]*)')
    if (locationMatch) {
      defaultParam.parameterLocation = locationMatch[1].toLowerCase()
      line = line.replace(locationMatch[0] + ' ', '')
    }

    const parts = line.split(' - ')
    const parameterName = parts[0]
    if (!parameterName) return

    let description = ''
    let metadata = ''

    if (parts.length === 2) {
      const second = parts[1]
      if (second.includes('@')) {
        metadata = second
      } else {
        description = second
      }
    } else if (parts.length === 3) {
      description = parts[1]
      metadata = parts[2]
    }

    if (metadata) {
      if (metadata.includes('@required')) {
        defaultParam.isRequired = true
      }

      const enumValues = getBetweenBrackets(metadata, 'enum')
      const exampleValue = getBetweenBrackets(metadata, 'example')
      const typeValue = getBetweenBrackets(metadata, 'type')

      if (typeValue) {
        defaultParam.dataType = typeValue
      }

      if (enumValues) {
        defaultParam.enumValues = enumValues.split(',')
        defaultParam.exampleValue = defaultParam.enumValues[0]
      }

      if (exampleValue) {
        defaultParam.exampleValue = exampleValue
      }
    }

    const parameter = {
      in: defaultParam.parameterLocation,
      name: parameterName,
      description: description,
      schema: {
        example: defaultParam.exampleValue,
        type: defaultParam.dataType,
        enum: defaultParam.enumValues,
      },
      required: defaultParam.isRequired,
    }

    if (defaultParam.enumValues.length > 1) {
      parameter.schema.enum = defaultParam.enumValues
    } else {
      delete parameter.schema.enum
    }

    if (
      typeof defaultParam.exampleValue === 'undefined' ||
      defaultParam.exampleValue === null
    ) {
      delete parameter.schema.example
    }

    return { [parameterName]: parameter }
  }

  private parseResponseHeader(responseLine: string) {
    let description = ''
    let example: any = ''
    let type = 'string'
    let enums = []
    const line = responseLine.replace('@responseHeader ', '')
    let [status, name, desc, meta] = line.split(' - ')

    if (typeof status === 'undefined' || typeof name === 'undefined') {
      return null
    }

    if (typeof desc !== 'undefined') {
      description = desc
    }

    if (name.includes('@use')) {
      let use = getBetweenBrackets(name, 'use')
      const used = use.split(',')
      let h = {}
      used.forEach((u) => {
        if (typeof this.options.common.headers[u] === 'undefined') {
          return
        }
        const common = this.options.common.headers[u]
        h = { ...h, ...common }
      })

      return {
        status: status,
        header: h,
      }
    }

    if (typeof meta !== 'undefined') {
      example = getBetweenBrackets(meta, 'example')
      const mtype = getBetweenBrackets(meta, 'type')
      if (mtype !== '') {
        type = mtype
      }
    }

    if (example === '' || example === null) {
      switch (type) {
        case 'string':
          example = 'string'
          break
        case 'integer':
          example = 1
          break
        case 'float':
          example = 1.5
          break
      }
    }

    let h = {
      schema: { type: type, example: example },
      description: description,
    }

    if (enums.length > 1) {
      h['schema']['enum'] = enums
    }
    return {
      status: status,
      header: {
        [name]: h,
      },
    }
  }

  private parseResponseBody(responseLine: string) {
    const responses = {}
    const line = responseLine.replace('@responseBody ', '')
    let [status, res, description] = line.split(' - ')
    if (typeof status === 'undefined') return

    if (typeof res === 'undefined') {
      responses[status] = {}
      return responses
    }

    if (typeof description === 'undefined') {
      responses[status] = this.parseBody(res, 'responseBody')
      return responses
    }

    responses[status] = this.parseBody(res, 'responseBody')
    responses[status]['description'] = description
    return responses
  }

  private parseRequestFormDataBody(rawLine: string) {
    const line = rawLine.replace('@requestFormDataBody ', '')
    let json = {},
      required = []
    const isJson = isJSONString(line)
    if (!isJson) {
      // try to get json from reference
      let rawRef = line.substring(line.indexOf('<') + 1, line.lastIndexOf('>'))

      const cleandRef = rawRef.replace('[]', '')
      if (cleandRef === '') {
        return
      }
      const parsedRef = this.exampleGenerator.parseRef(line, true)
      let props = []
      const ref = this.exampleGenerator.schemas[cleandRef]
      const ks = []
      if (ref.required && Array.isArray(ref.required))
        required.push(...ref.required)
      Object.entries(ref.properties).map(([key, value]) => {
        if (typeof parsedRef[key] === 'undefined') {
          return
        }
        ks.push(key)
        if (value['required']) required.push(key)
        props.push({
          [key]: {
            type:
              typeof value['type'] === 'undefined' ? 'string' : value['type'],
            format:
              typeof value['format'] === 'undefined'
                ? 'string'
                : value['format'],
          },
        })
      })
      const p = props.reduce((acc, curr) => ({ ...acc, ...curr }), {})
      const appends = Object.keys(parsedRef).filter((k) => !ks.includes(k))
      json = p
      if (appends.length > 0) {
        appends.forEach((a) => {
          json[a] = parsedRef[a]
        })
      }
    } else {
      json = JSON.parse(line)
      for (let key in json) {
        if (json[key].required === 'true') {
          required.push(key)
        }
      }
    }
    // No need to try/catch this JSON.parse as we already did that in the isJSONString function

    return {
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            properties: json,
            required,
          },
        },
      },
    }
  }

  private parseBody(rawLine: string, type: string) {
    let line = rawLine.replace(`@${type} `, '')

    const isJson = isJSONString(line)

    if (isJson) {
      // No need to try/catch this JSON.parse as we already did that in the isJSONString function
      const json = JSON.parse(line)
      const o = this.jsonToObj(json)
      return {
        content: {
          'application/json': {
            schema: {
              type: Array.isArray(json) ? 'array' : 'object',
              ...(Array.isArray(json) ? { items: this.arrayItems(json) } : o),
            },

            example: this.exampleGenerator.jsonToRef(json),
          },
        },
      }
    }
    return this.exampleGenerator.parseRef(line)
  }

  arrayItems(json) {
    const oneOf = []

    const t = typeof json[0]

    if (t === 'string') {
      json.forEach((j) => {
        const value = this.exampleGenerator.parseRef(j)

        if (has(value, 'content.application/json.schema.$ref')) {
          oneOf.push({
            $ref: value['content']['application/json']['schema']['$ref'],
          })
        }
      })
    }

    if (oneOf.length > 0) {
      return { oneOf: oneOf }
    }
    return { type: typeof json[0] }
  }

  jsonToObj(json) {
    const o = {
      type: 'object',
      properties: Object.keys(json)
        .map((key) => {
          const t = typeof json[key]
          const v = json[key]
          let value = v
          if (t === 'object') {
            value = this.jsonToObj(json[key])
          }
          if (t === 'string' && v.includes('<') && v.includes('>')) {
            value = this.exampleGenerator.parseRef(v)
            if (v.includes('[]')) {
              let ref = ''
              if (has(value, 'content.application/json.schema.$ref')) {
                ref = value['content']['application/json']['schema']['$ref']
              }
              if (has(value, 'content.application/json.schema.items.$ref')) {
                ref =
                  value['content']['application/json']['schema']['items'][
                  '$ref'
                  ]
              }
              value = {
                type: 'array',
                items: {
                  $ref: ref,
                },
              }
            } else {
              value = {
                $ref: value['content']['application/json']['schema']['$ref'],
              }
            }
          }
          return {
            [key]: value,
          }
        })
        .reduce((acc, curr) => ({ ...acc, ...curr }), {}),
    }
    return o
  }

  async getAnnotations(file: string, action: string) {
    let annotations = {}
    let newData = ''
    if (typeof file === 'undefined') return

    if (typeof this.parsedFiles[file] !== 'undefined') {
      newData = this.parsedFiles[file]
    } else {
      const data = await readFile(file, 'utf8')
      for (const line of data.split('\n')) {
        const l = line.trim()
        if (!l.startsWith('@')) {
          newData += l + '\n'
        }
      }
      this.parsedFiles[file] = newData
    }

    const comments = extract(newData)
    if (comments.length > 0) {
      comments.forEach((comment) => {
        if (comment.type !== 'BlockComment') return
        let lines = comment.value.split('\n').filter((l) => l != '')
        // fix for decorators
        if (lines[0].trim() !== '@' + action) return
        lines = lines.filter((l) => l != '')

        annotations[action] = this.parseAnnotations(lines)
      })
    }
    return annotations
  }

  private parseRequestQuery(line: string) {
    const rawLine = line.replace('@requestQuery ', '')
    let parameters = {}

    if (rawLine.startsWith('<') && rawLine.endsWith('>')) {
      const validatorName = rawLine.substring(1, rawLine.length - 1)
      const schema = this.exampleGenerator.schemas[validatorName]

      if (!schema) {
        console.warn(`Warning: Validator "${validatorName}" not found`)
        return null
      }

      Object.entries(schema.properties).forEach(([key, value]: [string, any]) => {
        parameters[key] = {
          in: 'query',
          name: key,
          schema: {
            type: value.type || 'string',
            format: value.format,
            enum: value.enum,
            example: value.example,
          },
          required: schema.required?.includes(key) || false,
          description: value.description || '',
        }

        Object.keys(parameters[key].schema).forEach(prop => {
          if (parameters[key].schema[prop] === undefined) {
            delete parameters[key].schema[prop]
          }
        })
      })
    }

    return parameters
  }
}

export class RouteParser {
  options: options
  constructor(options: options) {
    this.options = options
  }

  /*
    extract path-variables, tags and the uri-pattern
  */
  extractInfos(p: string) {
    let parameters = {}
    let pattern = ''
    let tags = []
    let required: boolean

    const split = p.split('/')
    if (split.length > this.options.tagIndex) {
      tags = [split[this.options.tagIndex].toUpperCase()]
    }
    split.forEach((part) => {
      if (part.startsWith(':')) {
        required = !part.endsWith('?')
        const param = part.replace(':', '').replace('?', '')
        part = '{' + param + '}'
        parameters = {
          ...parameters,
          [param]: {
            in: 'path',
            name: param,
            schema: {
              type: 'string',
            },
            required: required,
          },
        }
      }
      pattern += '/' + part
    })
    if (pattern.endsWith('/')) {
      pattern = pattern.slice(0, -1)
    }
    return { tags, parameters, pattern }
  }
}

export class ModelParser {
  exampleGenerator: ExampleGenerator
  snakeCase: boolean
  constructor(snakeCase: boolean) {
    this.snakeCase = snakeCase
    this.exampleGenerator = new ExampleGenerator({})
  }

  parseModelProperties(data) {
    let props = {}
    let required = []
    // remove empty lines
    data = data.replace(/\t/g, '').replace(/^(?=\n)$|^\s*|\s*$|\n\n+/gm, '')
    const lines = data.split('\n')
    let softDelete = false
    let name = ''
    lines.forEach((line, index) => {
      line = line.trim()
      // skip comments
      if (line.startsWith('export default class')) {
        name = line.split(' ')[3]
      }
      if (
        line.includes('@swagger-softdelete') ||
        line.includes('SoftDeletes')
      ) {
        softDelete = true
      }

      if (
        line.startsWith('//') ||
        line.startsWith('/*') ||
        line.startsWith('*') ||
        line.startsWith('public static ') ||
        line.startsWith('private static ') ||
        line.startsWith('static ')
      )
        return

      if (index > 0 && lines[index - 1].includes('serializeAs: null')) return
      if (index > 0 && lines[index - 1].includes('@no-swagger')) return
      if (
        !line.startsWith('public ') &&
        !line.startsWith('public get') &&
        !line.includes('declare ')
      )
        return

      let s = []

      if (line.includes('declare ')) {
        s = line.split('declare ')
      }
      if (line.startsWith('public ')) {
        if (line.startsWith('public get')) {
          s = line.split('public get')
          let s2 = s[1].replace(/;/g, '').split(':')
        } else {
          s = line.split('public ')
        }
      }

      let s2 = s[1].replace(/;/g, '').split(':')

      let field = s2[0]
      let type = s2[1]
      type = type.trim()
      let enums = []
      let format = ''
      let keyprops = {}
      let example: any = null

      if (index > 0 && lines[index - 1].includes('@enum')) {
        const l = lines[index - 1]
        let en = getBetweenBrackets(l, 'enum')
        if (en !== '') {
          enums = en.split(',')
          example = enums[0]
        }
      }

      if (index > 0 && lines[index - 1].includes('@format')) {
        const l = lines[index - 1]
        let en = getBetweenBrackets(l, 'format')
        if (en !== '') {
          format = en
        }
      }

      if (index > 0 && lines[index - 1].includes('@example')) {
        const l = lines[index - 1]
        let match = l.match(/example\(([^()]*)\)/g)
        if (match !== null) {
          const m = match[0].replace('example(', '').replace(')', '')
          example = m
          if (type === 'number') {
            example = parseInt(m)
          }
        }
      }

      if (index > 0 && lines[index - 1].includes('@required')) {
        required.push(field)
      }

      if (index > 0 && lines[index - 1].includes('@props')) {
        const l = lines[index - 1].replace('@props', 'props')
        const j = getBetweenBrackets(l, 'props')
        if (isJSONString(j)) {
          keyprops = JSON.parse(j)
        }
      }

      if (typeof type === 'undefined') {
        type = 'string'
        format = ''
      }

      field = field.trim()

      type = type.trim()

      //TODO: make oneOf
      if (type.includes(' | ')) {
        const types = type.split(' | ')
        type = types.filter((t) => t !== 'null')[0]
      }

      field = field.replace('()', '')
      field = field.replace('get ', '')
      type = type.replace('{', '').trim()

      if (this.snakeCase) {
        field = snakeCase(field)
      }

      let indicator = 'type'

      if (example === null) {
        example = 'string'
      }

      // if relation to another model
      if (type.includes('typeof')) {
        s = type.split('typeof ')
        type = '#/components/schemas/' + s[1].slice(0, -1)
        indicator = '$ref'
      } else {
        if (standardTypes.includes(type.toLowerCase())) {
          type = type.toLowerCase()
        } else {
          // assume its a custom interface
          indicator = '$ref'
          type = '#/components/schemas/' + type
        }
      }
      type = type.trim()
      let isArray = false

      if (
        line.includes('HasMany') ||
        line.includes('ManyToMany') ||
        line.includes('HasManyThrough') ||
        type.includes('[]')
      ) {
        isArray = true
        if (type.slice(type.length - 2, type.length) === '[]') {
          type = type.split('[]')[0]
        }
      }
      if (example === null || example === 'string') {
        example =
          this.exampleGenerator.exampleByField(field) ||
          this.exampleGenerator.exampleByType(type)
      }

      if (type === 'datetime') {
        indicator = 'type'
        type = 'string'
        format = 'date-time'
      }

      if (type === 'date') {
        indicator = 'type'
        type = 'string'
        format = 'date'
      }

      if (field === 'email') {
        indicator = 'type'
        type = 'string'
        format = 'email'
      }
      if (field === 'password') {
        indicator = 'type'
        type = 'string'
        format = 'password'
      }

      if (type === 'any') {
        indicator = '$ref'
        type = '#/components/schemas/Any'
      }

      let prop = {}
      if (type === 'integer' || type === 'number') {
        if (example === null || example === 'string') {
          example = Math.floor(Math.random() * 1000)
        }
      }
      if (type === 'boolean') {
        example = true
      }

      prop[indicator] = type
      prop['example'] = example
      // if array
      if (isArray) {
        props[field] = { type: 'array', items: prop }
      } else {
        props[field] = prop
        if (format !== '') {
          props[field]['format'] = format
        }
      }
      Object.entries(keyprops).map(([key, value]) => {
        props[field][key] = value
      })
      if (enums.length > 0) {
        props[field]['enum'] = enums
      }
    })

    if (softDelete) {
      props['deleted_at'] = {
        type: 'string',
        format: 'date-time',
        example: '2025-02-06T16:13:08.489+01:00',
      }
    }

    return { name: name, props: props, required: required }
  }
}

export class ValidatorParser {
  exampleGenerator: ExampleGenerator
  constructor() {
    this.exampleGenerator = new ExampleGenerator({})
  }
  async validatorToObject(validator: VineValidator<any, any>) {
    const obj = {
      type: 'object',
      properties: this.parseSchema(
        validator.toJSON()['schema']['schema'],
        validator.toJSON()['refs']
      ),
    }
    const testObj = this.objToTest(obj['properties'])
    return await this.parsePropsAndMeta(obj, testObj, validator)
  }

  async parsePropsAndMeta(obj, testObj, validator: VineValidator<any, any>) {
    const { SimpleMessagesProvider } = await import('@vinejs/vine')
    const [e] = await validator.tryValidate(testObj, {
      messagesProvider: new SimpleMessagesProvider({
        required: 'REQUIRED',
        string: 'TYPE',
        object: 'TYPE',
        number: 'TYPE',
        boolean: 'TYPE',
        enum: 'TYPE',
      }),
    })

    // if no errors, this means all object-fields are of type number (which we use by default)
    // and we can return the object
    if (e === null) {
      obj['example'] = testObj
      return obj
    }

    const msgs = e.messages

    for (const m of msgs) {
      const err = m['message']
      let objField = m['field'].replace('.', '.properties.')
      if (m['field'].includes('.0')) {
        objField = objField.replaceAll(`.0`, '.items')
      }
      if (err === 'TYPE') {
        const example = this.exampleGenerator.exampleByType(m['rule'], m['rule'] === 'enum' ? m?.['meta']?.['choices'] ?? [] : [])
        set(obj['properties'], objField, {
          ...get(obj['properties'], objField),
          type: m['rule'],
          example: example,
        })

        if (m['rule'] === 'string') {
          if (get(obj['properties'], objField)['minimum']) {
            set(obj['properties'], objField, {
              ...get(obj['properties'], objField),
              minLength: get(obj['properties'], objField)['minimum'],
            })
            unset(obj['properties'], objField + '.minimum')
          }
          if (get(obj['properties'], objField)['maximum']) {
            set(obj['properties'], objField, {
              ...get(obj['properties'], objField),
              maxLength: get(obj['properties'], objField)['maximum'],
            })
            unset(obj['properties'], objField + '.maximum')
          }
        }

        set(testObj, m['field'], example)
      }

      if (err === 'FORMAT') {
        set(obj['properties'], objField, {
          ...get(obj['properties'], objField),
          format: m['rule'],
          type: 'string',
          example: this.exampleGenerator.exampleByValidatorRule(m['rule']),
        })
        set(
          testObj,
          m['field'],
          this.exampleGenerator.exampleByValidatorRule(m['rule'])
        )
      }
    }

    obj['example'] = testObj
    return obj
  }

  objToTest(obj) {
    const res = {}
    Object.keys(obj).forEach((key) => {
      if (obj[key]['type'] === 'object') {
        res[key] = this.objToTest(obj[key]['properties'])
      } else if (obj[key]['type'] === 'array') {
        if (obj[key]['items']['type'] === 'object') {
          res[key] = [this.objToTest(obj[key]['items']['properties'])]
        } else {
          res[key] = [obj[key]['items']['example']]
        }
      } else {
        res[key] = obj[key]['example']
      }
    })
    return res
  }

  parseSchema(json, refs) {
    const obj = {}
    for (const p of json['properties']) {
      let meta: {
        minimum?: number
        maximum?: number
        choices?: any
        pattern?: string
      } = {}
      for (const v of p['validations']) {
        if (refs[v['ruleFnId']].options?.min) {
          meta = { ...meta, minimum: refs[v['ruleFnId']].options.min }
        }
        if (refs[v['ruleFnId']].options?.max) {
          meta = { ...meta, maximum: refs[v['ruleFnId']].options.max }
        }
        if (refs[v['ruleFnId']].options?.choices) {
          meta = { ...meta, choices: refs[v['ruleFnId']].options.choices }
        }
        if (refs[v['ruleFnId']].options?.toString().includes('/')) {
          meta = { ...meta, pattern: refs[v['ruleFnId']].options.toString() }
        }
      }

      obj[p['fieldName']] =
        p['type'] === 'object'
          ? { type: 'object', properties: this.parseSchema(p, refs) }
          : p['type'] === 'array'
            ? {
              type: 'array',
              items:
                p['each']['type'] === 'object'
                  ? {
                    type: 'object',
                    properties: this.parseSchema(p['each'], refs),
                  }
                  : {
                    type: 'number',
                    example: meta.minimum
                      ? meta.minimum
                      : this.exampleGenerator.exampleByType('number'),
                    ...meta,
                  },
            }
            : {
              type: 'number',
              example: meta.minimum
                ? meta.minimum
                : this.exampleGenerator.exampleByType('number'),
              ...meta,
            }
      if (!p['isOptional']) obj[p['fieldName']]['required'] = true
    }
    return obj
  }
}
