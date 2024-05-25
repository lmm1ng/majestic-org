export const chunkify = <T = unknown>(arr: T[], perChunk = 10) => {
  return arr.reduce((acc: T[][], cur: T, idx) => {
    const chunkIndex = Math.floor(idx / perChunk)

    if (!acc[chunkIndex]) {
      acc[chunkIndex] = []
    }
    acc[chunkIndex].push(cur)

    return acc
  }, [])
}

export const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
