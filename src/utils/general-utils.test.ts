import { findIndexes, isNumberBetween } from './general-utils'

it('should return array of indexes that callback returns as true', () => {
  expect(findIndexes([1, 5, 6, 4, 2, 9, 3], (val) => val < 4)).toEqual([0, 4, 6])
})

it('should return true if number is between min and max', () => {
  expect(isNumberBetween(-1, 0, 10)).toEqual(false)
  expect(isNumberBetween(0, 0, 10)).toEqual(false)
  expect(isNumberBetween(5, 0, 10)).toEqual(true)
  expect(isNumberBetween(10, 0, 10)).toEqual(false)
  expect(isNumberBetween(11, 0, 10)).toEqual(false)
})

it('should return true if number is inclusive of min and max', () => {
  expect(isNumberBetween(-1, 0, 10, true)).toEqual(false)
  expect(isNumberBetween(0, 0, 10, true)).toEqual(true)
  expect(isNumberBetween(5, 0, 10, true)).toEqual(true)
  expect(isNumberBetween(10, 0, 10, true)).toEqual(true)
  expect(isNumberBetween(11, 0, 10, true)).toEqual(false)
})
