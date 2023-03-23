import fs, {promises as fsPromises} from 'node:fs'
import Ajv, {JTDSchemaType} from 'ajv/dist/jtd'

import {Digest} from './digest'

const CACHE_FILENAME = '.genflowcache'

const ajv = new Ajv()

const schema: JTDSchemaType<Digest[]> = {
  elements: {
    properties: {
      filePath: {type: "string"},
      digest: {type: "string"}
    }
  }
}

const serialize = ajv.compileSerializer(schema)
const parse = ajv.compileParser(schema)

const readDigestCacheFile = async (filePath: string): Promise<Digest[]> => {
  const hasFile = fs.existsSync(filePath)
  if (!hasFile) {
    return []
  }
  const data = await fsPromises.readFile(filePath, {encoding: 'utf8'})
  const digests = parse(data)
  if (digests === undefined) {
    throw new Error(`${parse.position}: ${parse.message}`)
  } else {
    return digests
  }
}

const writeDigestCacheFile = async (filePath: string, digests: Digest[]): Promise<void> => {
  const data = serialize(digests)
  return await fsPromises.writeFile(filePath, data)
}

export const readDigestCache = () => readDigestCacheFile(CACHE_FILENAME)
export const writeDigestCache = (digests: Digest[]) => writeDigestCacheFile(CACHE_FILENAME, digests)
