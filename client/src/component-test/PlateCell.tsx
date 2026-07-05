import { useEffect, useRef, useState } from 'react'
import { TextField } from '@radix-ui/themes'
import { isAcceptablePrefix, isValidPlate } from './plate'
import { useVehiclesStore } from './useVehiclesStore'
import type { VehicleRow } from './types'

const DEBOUNCE_MS = 700

const PREFIX_PROMPT = 'Formato inválido: solo se acepta AAA111 o AA111AA. Corregí el valor.'
const FULL_INVALID_MESSAGE = 'Patente inválida. Formatos aceptados: AAA111 o AA111AA.'

export interface PlateCellProps {
  vehicle: VehicleRow
}

export function PlateCell({ vehicle }: PlateCellProps): JSX.Element {
  const updatePlate = useVehiclesStore((state) => state.updatePlate)

  const [value, setValue] = useState(vehicle.plate)
  const [promptMessage, setPromptMessage] = useState<string | null>(null)
  const [debounceError, setDebounceError] = useState<string | null>(null)
  const previousPlateRef = useRef(vehicle.plate)

  // Keep local value in sync if the store's plate changes from elsewhere.
  useEffect(() => {
    previousPlateRef.current = vehicle.plate
    setValue(vehicle.plate)
  }, [vehicle.plate])

  useEffect(() => {
    if (value === '') {
      setDebounceError(null)
      return
    }
    const timer = setTimeout(() => {
      setDebounceError(isValidPlate(value) ? null : FULL_INVALID_MESSAGE)
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [value])

  function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const next = event.target.value.toUpperCase()

    if (next !== '' && !isAcceptablePrefix(next)) {
      setPromptMessage(PREFIX_PROMPT)
      return
    }

    setPromptMessage(null)
    setValue(next)
  }

  function commit(next: string): void {
    if (isValidPlate(next)) {
      updatePlate(vehicle.id, next)
      previousPlateRef.current = next
      setValue(next)
      setDebounceError(null)
      setPromptMessage(null)
      return
    }

    // Empty (or otherwise incomplete) commit reverts to the previous plate.
    setValue(previousPlateRef.current)
    setDebounceError(null)
    setPromptMessage(null)
  }

  function handleBlur(): void {
    commit(value)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'Enter') {
      commit(value)
      event.currentTarget.blur()
    }
  }

  return (
    <div>
      <TextField.Root
        aria-label={`Patente de ${vehicle.id}`}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
      {promptMessage && (
        <div role="alert" style={{ fontSize: '0.75rem' }}>
          {promptMessage}
        </div>
      )}
      {debounceError && (
        <div role="alert" style={{ color: 'red', fontSize: '0.75rem' }}>
          {debounceError}
        </div>
      )}
    </div>
  )
}
