import { describe, it, expect } from 'vitest'
import { parseAndValidateRow } from './utils'

describe('parseAndValidateRow', () => {
  const validRow = {
    question: 'Test Question',
    option_a: 'A',
    option_b: 'B',
    option_c: 'C',
    option_d: 'D',
    answer: 'A',
    explain: 'Explanation',
    reference_url: 'https://example.com'
  }

  it('should parse valid row correctly', () => {
    const result = parseAndValidateRow(validRow)
    expect(result.answer).toBe('A')
    expect(result.question).toBe('Test Question')
  })

  it('should normalize lowercase answer and trim spaces', () => {
    const row = { ...validRow, answer: '  b  ' }
    const result = parseAndValidateRow(row)
    expect(result.answer).toBe('B')
  })

  it('should handle optional reference_url', () => {
    const row = { ...validRow, reference_url: '' }
    const result = parseAndValidateRow(row)
    expect(result.reference_url).toBeNull()
  })

  it('should throw error for invalid answer', () => {
    const row = { ...validRow, answer: 'E' }
    expect(() => parseAndValidateRow(row)).toThrow()
  })

  it('should throw error for missing question', () => {
    const row = { ...validRow, question: '' }
    expect(() => parseAndValidateRow(row)).toThrow()
  })
})
