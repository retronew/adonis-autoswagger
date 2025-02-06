export interface options {
  title?: string
  ignore: string[]
  version?: string
  description?: string
  path: string
  tagIndex: number
  snakeCase: boolean
  common: common
  fileNameInSummary?: boolean
  preferredPutPatch?: string
  persistAuthorization?: boolean
  appPath?: string
  debug?: boolean
  info?: any
  securitySchemes?: any
  authMiddlewares?: string[]
  defaultSecurityScheme?: string
}

export interface common {
  headers: any
  parameters: any
}

export interface AdonisRouteMeta {
  resolvedHandler: {
    type: string
    namespace?: string
    method?: string
  }
  resolvedMiddleware: Array<{
    type: string
    args?: any[]
  }>
}

export interface Handler {
  method?: string
  moduleNameOrPath?: string
  reference: string | any[]
  name: string
}

export interface AdonisRoute {
  methods: string[]
  pattern: string
  meta: AdonisRouteMeta
  middleware: string[] | any
  name?: string
  params: string[]
  handler?: string | Handler
}

export interface AdonisRoutes {
  root: AdonisRoute[]
}

export const standardTypes = [
  'string',
  'number',
  'integer',
  'datetime',
  'date',
  'boolean',
  'any',
]
  .map((type) => [type, type + '[]'])
  .flat()
