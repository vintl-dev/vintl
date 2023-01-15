import { defineBuildConfig } from 'unbuild'
import { babel } from '@rollup/plugin-babel'

export default defineBuildConfig({
  // IN CASE PACKAGE.JSON CHANGES:
  // 1. change this file ext to .ts.old
  // 2. run DEBUG=true pnpm exec unbuild
  // 3. wait until unbuild spills out all entries it found, ^C
  // 4. paste it here, add commas
  // 5. fix names for exports to preserve structure
  // 6. re-run pnpm exec unbuild and see that it prints no warning
  // 7. ???
  // 8. PROFIT!!
  //
  // WHY DO WE NEED THIS?
  // because unbuild doesn't preserve structure for files and tries to build everything in dist flat
  entries: [
    {
      input: './src/index',
      name: 'index',
      builder: 'rollup',
      declaration: true,
      outDir: './dist',
    },
    {
      input: './src/types/arguments',
      name: 'types/arguments',
      builder: 'rollup',
      declaration: true,
      outDir: './dist',
    },
    {
      input: './src/events/index',
      name: 'events/index',
      builder: 'rollup',
      declaration: true,
      outDir: './dist',
    },
    {
      input: './src/plugin',
      name: 'plugin',
      builder: 'rollup',
      declaration: true,
      outDir: './dist',
    },
    {
      input: './src/controller',
      name: 'controller',
      builder: 'rollup',
      declaration: true,
      outDir: './dist',
    },
    {
      input: './src/translateFunction',
      name: 'translateFunction',
      builder: 'rollup',
      declaration: true,
      outDir: './dist',
    },
    {
      input: './src/components',
      name: 'components',
      builder: 'rollup',
      declaration: true,
      outDir: './dist',
    },
    {
      input: './src/sources/header',
      name: 'sources/header',
      builder: 'rollup',
      declaration: true,
      outDir: './dist',
    },
    {
      input: './src/sources/navigator',
      name: 'sources/navigator',
      builder: 'rollup',
      declaration: true,
      outDir: './dist',
    },
  ],
  declaration: true,
  rollup: {
    emitCJS: true,
  },
  hooks: {
    'rollup:options'(_ctx, options) {
      if (!Array.isArray(options.plugins)) {
        if (options.plugins != null && typeof options.plugins !== 'boolean') {
          options.plugins = [options.plugins]
        } else {
          options.plugins = []
        }
      }

      for (let i = 0, l = options.plugins.length; i < l; i++) {
        const plugin = options.plugins[i]
        if (typeof plugin === 'object' && plugin != null) {
          if (!Array.isArray(plugin) && !('then' in plugin)) {
            if (plugin.name === 'esbuild') {
              options.plugins[i] = babel({
                babelHelpers: 'bundled',
                extensions: ['.ts', '.js', '.cjs', '.mjs', '.es', '.es6'],
                presets: [
                  [
                    '@babel/preset-env',
                    {
                      targets: 'defaults, node >= 16',
                    },
                  ],
                  '@babel/preset-typescript',
                ],
                plugins: ['@babel/plugin-proposal-nullish-coalescing-operator'],
              })
            }
          }
        }
      }
    },
  },
})
