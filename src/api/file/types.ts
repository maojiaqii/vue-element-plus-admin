export type Chunk = {
  chunkNumber: number
  chunkSize: number
  currentChunkSize: number | undefined
  totalSize: number
  identifier: string
  filename: string
  relativePath?: string
  totalChunks: number
  file?: any
}
