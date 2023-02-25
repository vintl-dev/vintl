# Precompiling messages

Messages can be pre-compiled to AST during the build, which allows to remove
parser and reduce bundle size. On this page we'll explore how to enable
pre-compilation using Rollup/Vite and `@braw/rollup-plugin-icu-messages`.

## Getting familiar with terms

### AST

AST stands for Abstract Syntax Tree, it is output produced by the parser which
can then be interpreted into a meaningful message.

Take simple message `'Hello, {name}!'` as an example. If you look closely,
consists of there parts: ‘Hello, ’ text, name argument and exclamation mark.
This is exactly how a parser would parse this message:

<!-- prettier-ignore -->
```js
[
  { type: 0, value: 'Hello, ' },
  { type: 1, value: 'name' },
  { type: 0, value: '!' },
]
```

### Parser

Parser is a code that essentially takes in a message, some parameters, and
produces an AST that can be then interpreted.

Parsing messages takes quite an amount of logic, hence why the parser is
relatively big (bigger than the interpreter and everything else).

## Parsing code during the build

[`@braw/rollup-plugin-icu-messages`](https://npm.im/@braw/rollup-plugin-icu-messages)
is a plugin for Rollup that allows to transform files containing messages into
JS code with compiled AST. It works great with Vue Intl Controller.

### Configuring `rollup-plugin-icu-messages`

Install the `@braw/rollup-plugin-icu-messages` package with your package manager
of choice:

:::code-group

```sh [npm]
npm i -D @braw/rollup-plugin-icu-messages
```

```sh [pnpm]
pnpm add -D @braw/rollup-plugin-icu-messages
```

```sh [yarn]
yarn add -D @braw/rollup-plugin-icu-messages
```

:::

To use the package simply import the package and use it in your `plugins` field
of Rollup / Vite configuration:

:::code-group

<!-- prettier-ignore -->
```ts [rollup.config.js]
import { defineConfig } from 'rollup'
import { icuMessages } from '@braw/rollup-plugin-icu-messages'

export default defineConfig({
  // …
  plugins: [
    // …
    icuMessages({ // [!code ++]
      format: 'crowdin', // [!code ++]
      include: 'src/lang/*.json', // [!code ++]
    }), // [!code ++]
    // …
  ],
})
```

<!-- prettier-ignore -->
```ts [vite.config.ts]
import { defineConfig } from 'vite'
import { icuMessages } from '@braw/rollup-plugin-icu-messages'

export default defineConfig({
  // …
  plugins: [
    // …
    icuMessages({ // [!code ++]
      format: 'crowdin', // [!code ++]
      include: 'src/lang/*.json', // [!code ++]
    }), // [!code ++]
    // …
  ],
})
```

:::

In the examples above we include all JSON files from the `src/lang` directory.
This means that any JSON file imported from that directory will be considered to
be a messages file in Crowdin format.

:::warning File name matters

File name determines the locale used, therefore each file in `lang` directory
needs to be named with a valid extension name. This can be changed by creating a
custom parsing options resolver.

:::

There are
[several formats](https://formatjs.io/docs/tooling/cli#builtin-formatters) your
files can be, and you can even create your own, but for simplicity Crowdin
format was chosen here.

If you already have a JSON parsing plugin (including built-in Vite JSON plugin),
the above configuration won't work due to conflict with these plugins. You can
resolve this conflict in two ways:

- If possible, configure JSON plugin to exclude all files from `src/lang`.
- Alternatively, use a wrapper plugin that comes with this package. It will wrap
  transformers for specified plugins to ignore files that would be handled by
  this plugin.

:::code-group

```js [rollup.config.js (exclusion)]
import { defineConfig } from 'rollup'
import json from '@rollup/plugin-json'

export default defineConfig({
  // …
  plugins: [
    // …
    json(), // [!code --]
    json({ exclude: ['src/lang/*.json'] }), // [!code ++]
  ],
})
```

```js [rollup.config.js (wrapping)]
import { defineConfig } from 'rollup'
import { icuMessagesWrapPlugins } from '@braw/rollup-plugin-icu-messages/wrap-plugins'

export default defineConfig({
  // …
  plugins: [
    // …
    icuMessagesWrapPlugins(), // [!code ++]
  ],
})
```

```ts [vite.config.ts (wrapping)]
import { defineConfig } from 'vite'
import { icuMessagesWrapPluginsVite } from '@braw/rollup-plugin-icu-messages/wrap-plugins'

export default defineConfig({
  // …
  plugins: [
    // …
    icuMessagesWrapPluginsVite(), // [!code ++]
  ],
})
```

:::

Now when you import any JSON file from the `src/lang` directory, that file will
be parsed and transformed to an AST.

:::code-group

```js [src/index.js]
import messages from './lang/en-US.json'

export default function example() {
  return messages
}
```

```json [src/lang/en-US.json]
{
  "greeting": {
    "message": "Hello, {name}!"
  }
}
```

<!-- prettier-ignore -->
```js [Output]
const greeting = [
	{
		type: 0,
		value: "Hello, "
	},
	{
		type: 1,
		value: "name"
	},
	{
		type: 0,
		value: "!"
	}
];
var messages = {
	greeting: greeting
};

function example() {
  return messages
}

export { example as default };
```

:::

## Excluding parser from runtime

If you pre-compile all of your messages, you don't anymore need parser in your
runtime, so you can remove it to reduce the bundle size.

By our calculations removing parser can reduce size of minified
`intl-messageformat` import by 76% (40,256 bytes ⇒ 9,565 bytes) or 72% when
gzipped (11,662 bytes ⇒ 3,242 bytes).

To remove the parser you need to alias import of
`@formatjs/icu-messageformat-parser` to
`@formatjs/icu-messageformat-parser/lib/no-parser`.

:::info

If you compile to CJS, you should instead alias to
`@formatjs/icu-messageformat-parser/no-parser`, otherwise you may encounter
compile errors due to incompatible format.

:::

:::code-group

```js [rollup.config.js]
import { defineConfig } from 'rollup'
import alias from '@rollup/plugin-alias'

export default defineConfig({
  // …
  plugins: [
    alias({
      entries: {
        '@formatjs/icu-messageformat-parser':
          '@formatjs/icu-messageformat-parser/lib/no-parser',
      },
    }),
  ],
})
```

```ts [vite.config.ts]
import { defineConfig } from 'vite'

export default defineConfig({
  // …
  resolve: {
    alias: {
      '@formatjs/icu-messageformat-parser':
        '@formatjs/icu-messageformat-parser/lib/no-parser',
    },
  },
})
```

:::

And just like that the parser is removed from the runtime :tada:
