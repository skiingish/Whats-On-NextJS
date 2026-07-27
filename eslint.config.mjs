// Flat ESLint config for D6 (tech-debt-backlog.md).
//
// This is NOT `import config from 'eslint-config-next/core-web-vitals'`,
// even though that's the standard, documented way to do this. It cannot be
// used here: eslint-config-next's default/core-web-vitals/typescript exports
// all `require('typescript-eslint')`, and that package throws synchronously
// at require-time under TypeScript 7 (the Go-based compiler this repo
// upgraded to):
//
//   Error: typescript-eslint does not support TS 7.0.
//   https://github.com/typescript-eslint/typescript-eslint/issues/10940
//
// Bypassing that guard (tried via an npm `overrides` pin to a pre-guard
// typescript-eslint release) doesn't help either — the failure just moves
// one layer down, into @typescript-eslint/typescript-estree's
// create-program logic, which reads `ts.Extension.Cjs` and other classic
// compiler-API internals that TS 7 no longer exposes:
//
//   TypeError: Cannot read properties of undefined (reading 'Cjs')
//     at .../typescript-estree/dist/create-program/shared.js:59
//
// This matches the note already in next.config.js about TS 7 dropping the
// classic compiler API. It's a real upstream incompatibility, not a config
// problem, and it isn't fixable by "tuning" — the crash happens before any
// rule or option is evaluated.
//
// So this file reconstructs eslint-config-next's actual rule set by hand,
// straight from node_modules/eslint-config-next/dist/index.js: same
// plugins (react, react-hooks, jsx-a11y, import, @next/next), same merged
// `recommended` rule sets, same rule overrides. The Babel parser it uses
// (see below) handles TS *syntax* fine — just without type-aware linting.
// The one thing genuinely dropped is eslint-config-next's
// second config block, which swaps in `@typescript-eslint`'s parser for
// .ts/.tsx files — but that block adds zero extra rules of its own in the
// shipped config, so nothing is actually disabled by leaving it out.
//
// Once typescript-eslint ships TS 7 support, delete this file's body and
// replace it with `export { default } from 'eslint-config-next/core-web-vitals'`.
import { createRequire } from 'node:module';

// Plain CJS `require`, not ESM `import`, for the plugin packages: Node's
// ESM/CJS interop only reliably exposes named exports for CJS modules that
// `cjs-module-lexer` can statically analyze, and eslint-plugin-import /
// eslint-plugin-jsx-a11y build their `module.exports` in a way it can't (an
// `import * as x` here silently yields `{ default, "module.exports" }`
// instead of `{ rules, configs, ... }`, and ESLint then fails to find any
// rule in the plugin). `require` sidesteps that entirely.
const require = createRequire(import.meta.url);
const nextPlugin = require('@next/eslint-plugin-next');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const importPlugin = require('eslint-plugin-import');
const jsxA11yPlugin = require('eslint-plugin-jsx-a11y');
const globals = require('globals');
// Not `eslint-config-next/parser`: that's Next's own vendored, precompiled
// copy of @babel/eslint-parser, bundled at Next's release time. It returns
// a scopeManager built against an older `eslint-scope` shape that ESLint 10
// doesn't recognise (`scopeManager.addGlobals is not a function`, thrown
// from ESLint core's SourceCode.finalize on every file). A fresh, current
// @babel/eslint-parser install doesn't have that problem.
const babelParser = require('@babel/eslint-parser');

/** @type {import('eslint').Linter.Config[]} */
const config = [
  {
    name: 'next',
    files: ['**/*.{js,jsx,mjs,ts,tsx,mts,cts}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      import: importPlugin,
      'jsx-a11y': jsxA11yPlugin,
      '@next/next': nextPlugin,
    },
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        sourceType: 'module',
        allowImportExportEverywhere: true,
        babelOptions: {
          // Not `next/babel`: that preset is pinned to @babel/core 7's
          // plugin API ("Requires Babel ^7.0.0-0, but was loaded with
          // 8.0.1") and there is no babel-core-8-compatible build of it in
          // this Next release. @babel/preset-react + @babel/preset-typescript
          // give the parser the same JSX/TS *syntax* support without going
          // through Next's preset at all — sufficient for linting, since we
          // are not asking Babel to emit runtime-transformed output here.
          presets: ['@babel/preset-react', '@babel/preset-typescript'],
          caller: { supportsTopLevelAwait: true },
        },
      },
      globals: { ...globals.browser, ...globals.node },
    },
    settings: {
      // Not `version: 'detect'`: eslint-plugin-react's auto-detect path
      // calls `context.getFilename()`, an ESLint API removed in v10
      // (replaced by `context.filename`), and crashes every file
      // ("contextOrFilename.getFilename is not a function"). Pinning the
      // version explicitly skips that code path entirely.
      react: { version: '19.2.8' },
      'import/resolver': {
        node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
        typescript: { alwaysTryTypes: true },
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      'import/no-anonymous-default-export': 'warn',
      'react/no-unknown-property': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'jsx-a11y/alt-text': ['warn', { elements: ['img'], img: ['Image'] }],
      'jsx-a11y/aria-props': 'warn',
      'jsx-a11y/aria-proptypes': 'warn',
      'jsx-a11y/aria-unsupported-elements': 'warn',
      'jsx-a11y/role-has-required-aria-props': 'warn',
      'jsx-a11y/role-supports-aria-props': 'warn',
      'react/jsx-no-target-blank': 'off',

      // eslint-plugin-react-hooks v7 ships the React Compiler rules, which
      // flag long-standing patterns in this codebase rather than anything the
      // recent work introduced — setState inside effects (VenueMap's drawer
      // sync, EventsCards, InstallAppButton), a mutated local in
      // EventsDisplay, and Math.random() during render in app/page.tsx.
      //
      // They are warnings, not off: each one is a real signal and they are
      // tracked as D31 in docs/tech-debt-backlog.md. Left as errors they would
      // make CI red from its very first run, which teaches everyone to ignore
      // it. Promote these back to 'error' once D31 is cleared.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/static-components': 'warn',
    },
  },
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'node_modules/**',
      'public/**',
      'supabase/**',
      'tests/visual/**',
      // Throwaway git worktrees used by background agents. They hold full
      // copies of the tree, so linting them triples every count and reports
      // stale versions of files that are already fixed here.
      '.claude/**',
    ],
  },
];

export default config;
