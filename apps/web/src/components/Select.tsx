import React, { useState, useRef, useEffect } from 'react'
import { clsx } from 'clsx'

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  className?: string
  id?: string
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  className,
  id
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(opt => opt.value === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  return (
    <div ref={selectRef} className="relative" id={id}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'w-full px-4 py-3 rounded-xl bg-base-gray border border-white/10',
          'text-white focus:outline-none focus:ring-2 focus:ring-base-yellow focus:border-transparent',
          'transition-all duration-200 appearance-none cursor-pointer',
          'hover:bg-base-yellow hover:text-base-black',
          'flex items-center justify-between',
          className
        )}
      >
        <span>{selectedOption?.label || 'Sélectionner...'}</span>
        <svg
          className={clsx('w-5 h-5 transition-transform duration-200', isOpen && 'rotate-180')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-[100] w-full mt-2 bg-base-gray border border-white/10 rounded-xl shadow-xl shadow-black/50 overflow-hidden">
          <div className="py-1 max-h-60 overflow-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={clsx(
                  'w-full px-4 py-3 text-left transition-all duration-150',
                  'hover:bg-base-yellow hover:text-base-black',
                  option.value === value
                    ? 'bg-base-yellow text-base-black font-medium'
                    : 'text-white'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

