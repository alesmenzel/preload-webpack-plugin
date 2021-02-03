import { Compiler, WebpackPluginInstance } from 'webpack';
import HtmlWebpackPlugin from "html-webpack-plugin"

declare namespace PreloadWebpackPlugin {
  interface PreloadWebpackPluginOptions {
    /**
     * Types of chunks to include.
     * - `initial` - Only initial chunks.
     * - `asyncChunks` - Only Async chunks.
     * - `allChunks` - Async chunks, vendor chunks, normal chunks.
     * - `allAssets` - Every asset, regardless of which chunk it's in.
     * @default 'initial'
     */
    include?: string;

    /**
     * Chunks to preload
     */
    fileWhitelist?: [];

    /**
     * Chunks NOT to preload
     * @default [/\.map/]
     */
    fileBlacklist?: [];

    /**
     * Browser hint, e.g. 'preload'
     * @default 'preload'
     */
    rel?: string;

    /**
     * Preload as
     * @default 'script'
     */
    as?: string;
  }
}

declare class PreloadWebpackPlugin implements WebpackPluginInstance {
  constructor(HtmlWebpackPlugin: HtmlWebpackPlugin, opts?: PreloadWebpackPlugin.PreloadWebpackPluginOptions);
  apply: (compiler: Compiler) => void;
}

export = PreloadWebpackPlugin;
