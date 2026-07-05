/**
 * Plate validation helpers (docs/verified-scope.md §7.1).
 *
 * Accepted formats:
 *  - AAA111: 3 letters + 3 digits
 *  - AA111AA: 2 letters + 3 digits + 2 letters
 */

type PlateSlot = 'L' | 'D'

const PATTERN_AAA111: readonly PlateSlot[] = ['L', 'L', 'L', 'D', 'D', 'D']
const PATTERN_AA111AA: readonly PlateSlot[] = ['L', 'L', 'D', 'D', 'D', 'L', 'L']

function isLetter(ch: string): boolean {
  return /^[A-Z]$/.test(ch)
}

function isDigit(ch: string): boolean {
  return /^[0-9]$/.test(ch)
}

function matchesSlots(value: string, pattern: readonly PlateSlot[]): boolean {
  if (value.length > pattern.length) return false
  for (let i = 0; i < value.length; i++) {
    const slot = pattern[i]
    const ch = value[i]
    if (ch === undefined || slot === undefined) return false
    if (slot === 'L' && !isLetter(ch)) return false
    if (slot === 'D' && !isDigit(ch)) return false
  }
  return true
}

/**
 * Returns true if `s` is a valid, complete plate matching either accepted format.
 * Input is treated case-insensitively (compared as uppercase).
 */
export function isValidPlate(s: string): boolean {
  const value = s.toUpperCase()
  return (
    (value.length === PATTERN_AAA111.length && matchesSlots(value, PATTERN_AAA111)) ||
    (value.length === PATTERN_AA111AA.length && matchesSlots(value, PATTERN_AA111AA))
  )
}

/**
 * Returns true if `s` could still become a valid plate as more characters are typed
 * (i.e. it is a valid prefix of either accepted format). Used to gate keystrokes.
 */
export function isAcceptablePrefix(s: string): boolean {
  const value = s.toUpperCase()
  return matchesSlots(value, PATTERN_AAA111) || matchesSlots(value, PATTERN_AA111AA)
}
