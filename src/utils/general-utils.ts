export const findIndexes = <T>(arr: T[], iterator: (val: T, index: number, arr: T[]) => boolean) => {
  return arr.reduce<number[]>((accum, val, index) => {
    return iterator(val, index, arr) ? accum.concat(index) : accum
  }, [])
}

export const isNumberBetween = (number: number, minNumber: number, maxNumber: number, inclusive?: boolean) => {
  const inclusiveResult = number >= minNumber && number <= maxNumber
  const result = number > minNumber && number < maxNumber
  return inclusive ? inclusiveResult : result
}

export const uniqueBy = <T>(arr: T[], iterator: (val: T, index: number, arr: T[]) => string) => {
  const indexesByKey: { [key: string]: number } = {}
  return arr.reduce<T[]>((accum, val, index) => {
    const key = iterator(val, index, arr)
    if (indexesByKey[key] === undefined) {
      indexesByKey[key] = index
      return accum.concat(val)
    }
    return accum
  }, [])
}

export const replaceAtIndex = <T>(arr: T[], index: number, operand?: T) => {
  return [...arr.slice(0, index), ...(operand !== undefined ? [operand] : []), ...arr.slice(index + 1)]
}

export const awaitMap = async <T, T2>(array: T[], iterator: (val: T, index: number, array: T[]) => T2) => {
  const results: T2[] = []
  for (const [index, val] of array.entries()) {
    results[index] = await iterator(val, index, array)
  }
  return results
}

export const clamp = (number: number, min: number, max: number) => {
  return Math.min(Math.max(number, min), max)
}
