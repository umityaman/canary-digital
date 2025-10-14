import React, { useState, MouseEvent } from 'react'

interface RippleProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export const RippleButton: React.FC<RippleProps> = ({
  children,
  className = '',
  onClick,
  disabled = false,
  type = 'button',
}) => {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])

  const addRipple = (event: MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget
    const rect = button.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const id = Date.now()

    setRipples([...ripples, { x, y, id }])

    setTimeout(() => {
      setRipples((prevRipples) => prevRipples.filter((ripple) => ripple.id !== id))
    }, 600)
  }

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      addRipple(event)
      onClick?.()
    }
  }

  return (
    <button
      type={type}
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full pointer-events-none animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
          }}
        />
      ))}
    </button>
  )
}
