/**
 * @license
 * Copyright 2018 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const defaultOptions = require('./lib/default-options')
const determineAsValue = require('./lib/determine-as-value')
const doesChunkBelongToHTML = require('./lib/does-chunk-belong-to-html')
const extractChunks = require('./lib/extract-chunks')
const HTMLWebpackPlugin = require('html-webpack-plugin')

class PreloadPlugin {
  constructor (options) {
    this.options = {
      rel: 'preload',
      include: 'asyncChunks',
      excludeHtmlNames: [],
      fileBlacklist: [/\.map/],
      ...options,
    }
  }

  generateLinks (compilation, htmlPluginData) {
    const {include, fileWhitelist, fileBlacklist, rel, as: optionAs} = this.options

    const extractedChunks = extractChunks({
      compilation,
      optionsInclude: include
    })

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
            rel,
          }
        }
        // If we're preloading this resource (as opposed to prefetching),
        // then we need to set the 'as' attribute correctly.
        if (rel === 'preload') {
          link.attributes.as = determineAsValue({
            href,
            file,
            optionsAs: optionAs
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
  }

  apply (compiler) {
    const {name} = this.constructor

    compiler.hooks.compilation.tap(
      name,
      compilation => {
        const htmlHooks = HTMLWebpackPlugin.getHooks(compilation)

        htmlHooks.afterTemplateExecution.tap(name, (htmlPluginData) => {
          this.generateLinks(compilation, htmlPluginData)
        })
      }
    )
  }
}

module.exports = PreloadPlugin
