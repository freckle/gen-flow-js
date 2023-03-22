import {beautify, compiler} from "flowgen"
import fs from "node:fs"
import path from "node:path"

module.exports = async (paths: string[]) => {
  for (const p of paths) {
    await processFile(p)
  }
}

const processFile = (f: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const flowdef = beautify(compiler.compileDefinitionFile(f, {inexact: false}))
    const fixedFlowdef = fixFlowdef(flowdef)
    const p = path.parse(f)
    const regexExec = /(.*).d/.exec(p.name)
    if (regexExec === null) {
      throw new Error('Unexpected RegExp failure')
    }
    const name = regexExec[1]
    const filename = `${p.dir}/${name}.js.flow`
    fs.writeFile(
      filename,
      `// @flow
${fixedFlowdef}`,
      e => {
        if (e) reject(e)
        else resolve()
      }
    )
  })

const fixFlowdef = (module: string): string => {
  return (
    module
      // account for special cases
      .replace(
        /React.Element<ElementType, string \| React.JSXElementConstructor<any>>/g,
        'React.Node'
      )
      // https://github.com/joarwilk/flowgen/issues/185
      .replace(/\btype,\s+/g, 'type ')
      // Imports for TS types that are global in Flow need to be removed
      .replaceAll(`import { type SyntheticEvent } from "react";`, '')
      .replaceAll(`import type { SyntheticEvent } from "react";`, '')
      .replaceAll(`import type { ChangeEvent, KeyboardEvent } from "react";`, '')
      .replaceAll(`import { ChangeEvent } from "react";`, '')
      // Convert React TS types to Flow equivalents
      .replaceAll('React.AriaRole', '?string') // Flow does not have an AriaRole
      .replaceAll('ChangeEvent', 'SyntheticInputEvent')
      .replaceAll(`import type { SyntheticInputEvent } from "react";`, '')
      .replaceAll('React.KeyboardEvent', 'SyntheticKeyboardEvent')
      .replaceAll('React.ElementType<any>', 'React.ElementType')
      // Convert missing types to ones that can be shimmed globally
      .replaceAll('React.ForwardRefExoticComponent', 'GlobalForwardRefExoticComponent')
      .replaceAll('React.RefAttributes', 'GlobalRefAttributes')
      .replaceAll('React.LegacyRef', 'GlobalLegacyRef')
      // Third party libraries may also have different interfaces in TS/Flow
      .replaceAll('RouteComponentProps', 'ContextRouter')
      .replaceAll('import { type Location } from "history";', '')
      .replaceAll('import type { History } from "history";', '')
      .replaceAll('import { type History } from "history";', '')
      // Flow's React.Element is different than in TypeScript, so convert to React.Node
      .replace(/\sReact\.Element<+([a-z- A-Z<>>]+)>+/g, ' React.Node') // Account for React.Element<Type<...>>
      .replace(/React\.Element<(.*?)>/g, 'React.Node') // Handle simpler case
      // Flow refuses to render a PureComponent; prefer rewriting the interface
      // to changing the component implementation
      .replaceAll('React.PureComponent', 'React.Component')
      .replaceAll('React.NamedExoticComponent', 'React.ComponentType')
      .replaceAll('React.ComponentClass', 'React.ComponentType')
      // Collapse React.Node union as last step since other rules may create a React.Node
      .replaceAll('React.Node | React.Node[]', 'React.Node')
      // flowts converts ?a into a | undefined | null
      // flowgen converts a | undefined | null into a | void | null
      // a | void | null is not treated the same as ?a in flow
      .replaceAll(/([a-zA-Z_$][0-9a-zA-Z_$]*) \| void \| null/g, (_match, name) => `?${name}`)
      // flowgen uses mixins instead of extends?
      .replaceAll(/(class\s+\S+\s+)mixins/g, (_match, c) => `${c}extends`)
      // fetch uses RequestOptions in flow
      .replaceAll('RequestInit', 'RequestOptions')
      .replaceAll('Record<string, empty>', '{}')
  )
}
