import React from 'react'
import { clsx } from 'clsx'

interface InputProps {
  type?: 'text' | 'email' | 'password'
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  error?: string
  label?: string
  required?: boolean
  className?: string
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  label,
  required = false,
  className
}) => {
  return (
    <div className={clsx('space-y-2', className)}>
      {label && (
        <label className="text-sm font-medium text-white/80">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={clsx(
          'w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10',
          'text-white placeholder-white/40 focus:outline-none focus:ring-2',
          'focus:ring-base-yellow/50 focus:border-base-yellow/50',
          'transition-all duration-200',
          error && 'border-red-500/50 focus:ring-red-500/50'
        )}
      />
      {error && (
        <p className="text-sm text-red-400 animate-slide-up">{error}</p>
      )}
    </div>
  )
}