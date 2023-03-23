import {computeDigest, compare} from "./digest"

jest.mock('node:fs', () => ({
  readFileSync: () => 'test'
}))

describe('Digest', () => {
  describe('computeDigest', () => {
    it('computes a valid Digest', () => {
      const digest = computeDigest('path/to/file')
      expect(digest).toEqual({
        filePath: 'path/to/file',
        digest: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
      })
    })
  })
  
  describe('compare', () => {
    it('succeeds with identical Digests', () => {
      const a = {
        filePath: 'path/to/file',
        digest: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
      }
      const b = {
        filePath: 'path/to/file',
        digest: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
      }
      const res = compare(a, b)
      expect(res).toEqual(true)
    })
    
    it('rejects Digests of different files', () => {
      const a = {
        filePath: 'path/to/file',
        digest: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
      }
      const b = {
        filePath: 'path/to/different/file',
        digest: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
      }
      const res = compare(a, b)
      expect(res).toEqual(false)
    })
  })
})
