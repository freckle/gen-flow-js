# @freckle/gen-flow

Generate Flow type interfaces from TypeScript interfaces.

## Install

```sh
yarn add -D @freckle/gen-flow
```

## Usage

Generate Flow interfaces given a path containing TypeScript interfaces (`.d.ts`
files). The Flow interfaces will be adjacent to the TypeScript interfaces.

```sh
> ls dist/
index.d.ts index.js

> yarn run gen-flow dist

> ls dist/
index.d.ts index.js index.js.flow
```

This can be used as part of a build process in a project:

```json
{
  "name": "my-package",
  "scripts": {
    "build": "yarn clean && tsc -d && yarn gen-flow",
    "gen-flow": "gen-flow dist",
    "clean": "rm -r -f dist/""
  }
}

```

## Versioning and release process##

See [RELEASE.md](./RELEASE.md)

---

[LICENSE](./LICENSE)
