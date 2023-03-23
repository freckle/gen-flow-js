import crypto from 'node:crypto'
import fs from 'node:fs'

export interface Digest {
  filePath: string
  digest: string
}

export const computeDigest = (filePath: string): Digest => {
  const buffer = fs.readFileSync(filePath)
  const hashSum = crypto.createHash('sha256')
  hashSum.update(buffer)

  return {
    filePath,
    digest: hashSum.digest('hex')
  }
}

export const compare = (a: Digest, b: Digest): boolean => {
  return (a.filePath === b.filePath) && (a.digest === b.digest)
}
