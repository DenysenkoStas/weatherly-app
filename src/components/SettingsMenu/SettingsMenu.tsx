import { useEffect, useId, useRef, useState } from 'react'
import type { TemperatureUnit, Units, WindUnit } from '../../types'
import styles from './SettingsMenu.module.scss'

const TEMPERATURE_UNITS: readonly TemperatureUnit[] = ['celsius', 'fahrenheit']
const WIND_UNITS: readonly WindUnit[] = ['ms', 'kmh']

interface SettingsMenuTranslations {
  settings: string
  temperature: string
  wind: string
  temp_units: Record<TemperatureUnit, string>
  wind_units: Record<WindUnit, string>
}

interface SettingsMenuProps {
  units: Units
  onTemperatureChange: (unit: TemperatureUnit) => void
  onWindChange: (unit: WindUnit) => void
  // Same look as the other header buttons
  buttonClassName?: string
  t: SettingsMenuTranslations
}

interface OptionGroupProps<T extends string> {
  name: string
  legend: string
  options: readonly T[]
  value: T
  labels: Record<T, string>
  onChange: (value: T) => void
}

function OptionGroup<T extends string>({
  name,
  legend,
  options,
  value,
  labels,
  onChange,
}: OptionGroupProps<T>) {
  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.segmented}>
        {options.map((option) => (
          <label key={option} className={styles.option}>
            <input
              className={styles.input}
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
            />
            <span className={styles.optionLabel}>{labels[option]}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function SettingsMenu({
  units,
  onTemperatureChange,
  onWindChange,
  buttonClassName,
  t,
}: SettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setIsOpen(false)
      buttonRef.current?.focus()
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const summary = `${t.temp_units[units.temperature]}, ${t.wind_units[units.wind]}`

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className={buttonClassName}
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        aria-label={`${t.settings}: ${summary}`}
        title={t.settings}
      >
        {t.temp_units[units.temperature]}
      </button>

      {isOpen && (
        <div id={menuId} className={styles.menu} role="group" aria-label={t.settings}>
          <OptionGroup
            name={`${menuId}-temperature`}
            legend={t.temperature}
            options={TEMPERATURE_UNITS}
            value={units.temperature}
            labels={t.temp_units}
            onChange={onTemperatureChange}
          />
          <OptionGroup
            name={`${menuId}-wind`}
            legend={t.wind}
            options={WIND_UNITS}
            value={units.wind}
            labels={t.wind_units}
            onChange={onWindChange}
          />
        </div>
      )}
    </div>
  )
}
