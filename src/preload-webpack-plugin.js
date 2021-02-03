const { determineAsValue, extractChunks } = require('./utils')
const HTMLWebpackPlugin = require('html-webpack-plugin')

class PreloadPlugin {
  constructor (options) {
    this.options = {
      rel: 'preload',
      include: 'initial',
      fileBlacklist: [/\.map/],
      ...options
    }
  }

  generateLinks (compilation, htmlPluginData) {
    const { include, fileWhitelist, fileBlacklist, rel, as: optionAs } = this.options

    const htmlChunks = extractChunks({ compilation, include })

    // Flatten the list of files.
    const allFiles = htmlChunks.reduce((acc, chunk) => [...acc, ...chunk.files], [])
    const uniqueFiles = [...new Set(allFiles)]
    const publicPath = compilation.outputOptions.publicPath || ''

    const links = uniqueFiles
      // Whitelist
      .filter(file => {
        return (
          !fileWhitelist ||
          fileWhitelist.some(regex => regex.test(file))
        )
      })
      // Blacklist
      .filter(file => {
        return (
          !fileBlacklist ||
          fileBlacklist.every(regex => !regex.test(file))
        )
      })
      // Sort to ensure the output is predictable.
      .sort()
      .map(file => {
        const href = `${publicPath}${file}`
        const link = {
          tagName: 'link',
          attributes: {
            href,
            rel
          }
        }
        // If we're preloading this resource (as opposed to prefetching),
        // then we need to set the 'as' attribute correctly.
        if (rel === 'preload') {
          link.attributes.as = determineAsValue({
            href,
            file,
            as: optionAs
          })
        }
        // On the off chance that we have a cross-origin 'href' attribute,
        // set crossOrigin on the <link> to trigger CORS mode. Non-CORS
        // fonts can't be used.
        if (link.attributes.as === 'font') {
          link.attributes.crossorigin = ''
        }
        return link
      })

    htmlPluginData.headTags = [...links, ...htmlPluginData.headTags]
    return htmlPluginData
  }

  apply (compiler) {
    const { name } = this.constructor

    compiler.hooks.compilation.tap(
      name,
      compilation => {
        const htmlHooks = HTMLWebpackPlugin.getHooks(compilation)

        htmlHooks.afterTemplateExecution.tap(name, (htmlPluginData) => {
          return this.generateLinks(compilation, htmlPluginData)
        })
      }
    )
  }
}

module.exports = PreloadPlugin
