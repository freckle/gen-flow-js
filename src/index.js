const os = require('os')
const glob = require('glob')
const path = require('path')
const chunk = require('lodash/chunk')
const Piscina = require('piscina')

const [_nodeBin, _scriptPath, ...args] = process.argv

if (args.length !== 1) {
  console.log('Usage: gen-flow <path/to/interfaces>')
  return
}

const [libPath] = args

// Create a new thread pool
const pool = new Piscina()
const options = {filename: path.resolve(__dirname, 'worker-pool')}

glob(`${libPath}/**/*.d.ts`, {}, async (err, files) => {
  if (err) console.error(err)

  const n = os.cpus().length
  const fileChunks = chunk(files, Math.ceil(files.length / n))
  const promises = fileChunks.map(fileChunk => pool.run(fileChunk, options))
  await Promise.all(promises)
})
