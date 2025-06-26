"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  id?: string
}

export function ColorPicker({ color, onChange, id }: ColorPickerProps) {
  const [inputColor, setInputColor] = useState(color)
  const colorInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setInputColor(color)
  }, [color])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setInputColor(newColor)

    // Validate if it's a proper hex color
    if (/^#([0-9A-F]{3}){1,2}$/i.test(newColor)) {
      onChange(newColor)
    }
  }

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setInputColor(newColor)
    onChange(newColor)
  }

  return (
    <div className="flex">
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="w-10 h-10 rounded-l-md border border-r-0 border-gray-200"
            style={{ backgroundColor: color }}
            aria-label="Pick a color"
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <div className="w-10 h-10 rounded-md" style={{ backgroundColor: color }} />
              <Input value={inputColor} onChange={handleInputChange} className="w-24 h-10" />
            </div>
            <input
              ref={colorInputRef}
              type="color"
              value={color}
              onChange={handleColorPickerChange}
              className="w-full h-10 cursor-pointer"
            />
            <div className="grid grid-cols-5 gap-1 mt-2">
              {[
                "#017489",
                "#006955",
                "#02609E",
                "#013A87",
                "#2563eb",
                "#7c3aed",
                "#c026d3",
                "#e11d48",
                "#f97316",
                "#84cc16",
              ].map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  className="w-6 h-6 rounded-md border border-gray-200"
                  style={{ backgroundColor: presetColor }}
                  onClick={() => {
                    setInputColor(presetColor)
                    onChange(presetColor)
                  }}
                  aria-label={`Select color ${presetColor}`}
                />
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Input
        id={id}
        value={inputColor}
        onChange={handleInputChange}
        className="rounded-l-none border-[#017489]/20 focus:border-[#017489] focus:ring-[#017489]/20"
        placeholder="#000000"
      />
    </div>
  )
}
