import os from 'node:os'
import path from 'node:path'
import glob from 'glob'
import chunk from 'lodash/chunk'
import flatten from 'lodash/flatten'
import Piscina from 'piscina'

import {WorkerPoolData} from './worker-pool'
import {Digest} from './digest'
import {readDigestCache, writeDigestCache} from './digest-cache'

const main = async () => {
  const [_nodeBin, _scriptPath, ...args] = process.argv
  
  if (args.length !== 1) {
    console.log('Usage: gen-flow <path/to/interfaces>')
    return
  }
  
  const [libPath] = args
  
  const digestCache = await readDigestCache()
  
  // Create a new thread pool
  const pool = new Piscina()
  const options = {filename: path.resolve(__dirname, 'worker-pool')}
  
  glob(`${libPath}/**/*.d.ts`, {}, async (err, files) => {
    if (err) console.error(err)
  
    const n = os.cpus().length
    const fileChunks = chunk(files, Math.ceil(files.length / n))
    const promises: Promise<Digest[]>[] = fileChunks.map(fileChunk => {
      const data = {
        paths: fileChunk,
        digests: digestCache
      } as WorkerPoolData
      return pool.run(data, options)
    })
    const res = await Promise.all(promises)
    const digests = flatten(res)
    await writeDigestCache(digests)
  })
}

main()
