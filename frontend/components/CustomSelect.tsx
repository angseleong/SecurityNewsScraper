"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"

interface Option {
  value: string
  label: string
}

interface CustomSelectProps {
  value: string
  options: Option[]
  onChange: (value: string) => void
  className?: string
  width?: string
}

const mono: React.CSSProperties = { fontFamily: 'var(--font-fira-code), monospace' }

export default function CustomSelect({ value, options, onChange, className = "", width = "auto" }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(o => o.value === value) || options[0]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className={`relative ${className} shrink-0`} ref={ref} style={{ width }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer transition-all duration-200"
        style={{
          ...mono,
          backgroundColor: value ? '#151617' : '#000000',
          border: value ? '1px solid #34d59a' : isOpen ? '1px solid #797d86' : '1px solid #303236',
          borderRadius: 9999,
          padding: '8px 16px',
          fontSize: 12,
          color: value ? '#34d59a' : '#797d86',
        }}
      >
        <span className="truncate mr-2 font-medium tracking-wide">{selectedOption?.label}</span>
        <ChevronDown size={14} className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div 
          className="absolute top-[calc(100%+8px)] left-0 min-w-full w-max z-50 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200"
          style={{
            backgroundColor: '#0a0a0b',
            border: '1px solid #303236',
            borderRadius: 8,
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.8)'
          }}
        >
          <div className="flex flex-col py-1">
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value)
                  setIsOpen(false)
                }}
                className="px-4 py-2.5 cursor-pointer transition-colors text-[11px] font-medium tracking-wide hover:bg-[#151617] whitespace-nowrap"
                style={{
                  ...mono,
                  color: opt.value === value ? '#34d59a' : '#94979e',
                  backgroundColor: opt.value === value ? 'rgba(52,213,154,0.05)' : 'transparent',
                }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
