const path = require('path')
const { URL } = require('url')

function determineAsValue ({ as: optionAs, href, file }) {
  if (!optionAs) {
    // If `as` value is not provided in option, dynamically determine the correct
    // value based on the suffix of filename.
    const url = new URL(file || href, 'https://example.com')
    const extension = path.extname(url.pathname)

    if (extension === '.css') {
      return 'style'
    }

    if (extension === '.woff2') {
      return 'font'
    }

    return 'script'
  }

  const type = typeof optionAs

  switch (type) {
    case 'string': {
      return optionAs
    }

    case 'function': {
      return optionAs(href)
    }

    default:
      throw new Error(`Unknown as option '${optionAs}' for PreloadWebpackPlugin`)
  }
}

/**
 * Return whether a chunk can be initial (= not async)
 * @param {import('webpack').Chunk} chunk
 */
function isAsync (chunk) {
  return !chunk.canBeInitial()
}

/**
 * Return chunks by include option
 * @param {{compilation: import('webpack').Compilation, include: string}} options
 * @return {Array<{files: string[]}>}
 */
function extractChunks ({ compilation, include }) {
  const chunks = [...compilation.chunks]

  // 'asyncChunks' are chunks intended for lazy/async loading usually generated as
  // part of code-splitting with import() or require.ensure(). By default, asyncChunks
  // get wired up using link rel=preload when using this plugin
  if (include === 'asyncChunks') {
    return chunks.filter(chunk => isAsync(chunk)).map(chunk => ({ files: [...chunk.files] }))
  }

  // Vendor chunks, normal chunks
  if (include === 'initial') {
    return chunks.filter(chunk => !isAsync(chunk)).map(chunk => ({ files: [...chunk.files] }))
  }

  // Async chunks, vendor chunks, normal chunks
  if (include === 'allChunks') {
    return chunks.map(chunk => ({ files: [...chunk.files] }))
  }

  // Every asset, regardless of which chunk it's in.
  // Wrap it in a single, "psuedo-chunk" return value.
  if (include === 'allAssets') {
    return [{ files: Object.keys(compilation.assets) }]
  }

  throw new Error(`Unknown include option '${include}' for PreloadWebpackPlugin`)
}

module.exports = { determineAsValue, extractChunks }
