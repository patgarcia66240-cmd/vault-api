import React from 'react'
import { clsx } from 'clsx'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  hover = false
}) => {
  return (
    <div
      className={clsx(
        'backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl',
        'shadow-xl shadow-black/20',
        hover && 'hover:bg-white/10 hover:scale-[1.02] hover:shadow-2xl',
        'transition-all duration-300 ease-out',
        className
      )}
    >
      {children}
    </div>
  )
}