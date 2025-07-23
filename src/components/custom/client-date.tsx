'use client'

import { useEffect, useState } from 'react'

interface ClientDateProps {
  date: string | Date
  format?: 'short' | 'long' | 'full'
  className?: string
}

export function ClientDate({ date, format = 'short', className }: ClientDateProps) {
  const [formattedDate, setFormattedDate] = useState<string>('')

  useEffect(() => {
    const d = new Date(date)
    let options: Intl.DateTimeFormatOptions

    switch (format) {
      case 'short':
        options = {
          month: 'short',
          day: 'numeric',
        }
        break
      case 'long':
        options = {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }
        break
      case 'full':
        options = {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }
        break
      default:
        options = {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }
    }

    setFormattedDate(d.toLocaleDateString('ko-KR', options))
  }, [date, format])

  return <span className={className}>{formattedDate}</span>
}