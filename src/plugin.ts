import type * as ts from "typescript/lib/tsserverlibrary"

export default class LspPlugin {
  private info?: ts.server.PluginCreateInfo
  constructor(private readonly typescript: typeof ts) { }

  log(info: any) {
    this.info?.project.projectService.logger.info('[**ts-inline-webpack-loader-plugin**]: ' + JSON.stringify(info))
  }

  create(info: ts.server.PluginCreateInfo) {
    this.info = info
    const resolveModuleNames = info.languageServiceHost.resolveModuleNames
    const proxyResolveModuleNames: typeof resolveModuleNames = (moduleNames: string[], containingFile: string, ...rest) => {
      const pattern = /^((!!|-!|!)?[\w-]+(\?[\w=]+)?\!)+/
      moduleNames = moduleNames.map(_ => {
        if (pattern.test(_)) {
          return _.replace(pattern, '')
        }
        return _
      })
      if (resolveModuleNames) {
        return resolveModuleNames?.call(info.languageServiceHost, moduleNames, containingFile, ...rest)
      } else {
        return []
      }
    }
    info.languageServiceHost.resolveModuleNames = proxyResolveModuleNames
    return info.languageService
  }
}
