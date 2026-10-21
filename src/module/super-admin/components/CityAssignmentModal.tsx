/**
 * @file src/module/super-admin/components/CityAssignmentModal.tsx
 * Multi-city coverage allocation editor shared by the admin roster and the
 * pending admin approval queue.
 */

import { useState } from 'react'
import { MapPin, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PanelModal } from './PanelModal'
import { CITIES } from '@/module/home/data/cities'

const ALL_CITY_OPTIONS = CITIES.map((city) => city.defaultName)

interface CityAssignmentModalProps {
  isOpen: boolean
  adminName: string
  selectedCities: string[]
  isSaving: boolean
  onToggleCity: (city: string) => void
  onAddCustomCity: (city: string) => void
  onSave: () => void
  onClose: () => void
}

export function CityAssignmentModal({
  isOpen,
  adminName,
  selectedCities,
  isSaving,
  onToggleCity,
  onAddCustomCity,
  onSave,
  onClose,
}: CityAssignmentModalProps) {
  const [customCityInput, setCustomCityInput] = useState('')

  const handleAddCustomCity = () => {
    const value = customCityInput.trim()
    if (!value) return
    onAddCustomCity(value)
    setCustomCityInput('')
  }

  return (
    <PanelModal
      isOpen={isOpen}
      title={`Assign Cities for ${adminName}`}
      description="Select every region this admin is authorized to oversee."
      icon={<MapPin className="size-5" />}
      onClose={onClose}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="cursor-pointer rounded-full border-cream-300 text-xs font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="cursor-pointer rounded-full bg-navy-900 text-xs font-semibold text-white hover:bg-navy-700"
          >
            {isSaving ? 'Saving changes…' : 'Save City Assignments'}
          </Button>
        </>
      }
    >
      {/* Currently assigned */}
      <div className="mb-4 rounded-xl border border-cream-300/80 bg-cream-50/70 p-3">
        <span className="mb-2 block text-[0.68rem] font-bold tracking-[0.14em] text-ink-400 uppercase">
          Currently Assigned ({selectedCities.length})
        </span>
        <div className="flex flex-wrap gap-1.5">
          {selectedCities.length === 0 ? (
            <span className="text-xs text-ink-400 italic">
              No cities selected yet.
            </span>
          ) : (
            selectedCities.map((city) => (
              <span
                key={city}
                className="inline-flex items-center gap-1 rounded-full bg-navy-900 px-3 py-1 text-xs font-semibold text-white"
              >
                {city}
                <button
                  type="button"
                  onClick={() => onToggleCity(city)}
                  className="cursor-pointer rounded-full text-gold-300 transition-colors hover:text-gold-200 focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:outline-none"
                  aria-label={`Remove ${city}`}
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {/* Quick select */}
      <div className="mb-4">
        <span className="mb-2 block text-[0.68rem] font-bold tracking-[0.14em] text-ink-400 uppercase">
          Quick Select Available Cities
        </span>
        <div className="panel-scroll flex max-h-36 flex-wrap gap-1.5 overflow-y-auto p-1">
          {ALL_CITY_OPTIONS.map((city) => {
            const isSelected = selectedCities.includes(city)
            return (
              <button
                key={city}
                type="button"
                onClick={() => onToggleCity(city)}
                aria-pressed={isSelected}
                className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:outline-none ${
                  isSelected
                    ? 'border-gold-700 bg-gold-600 text-white'
                    : 'border-cream-300 bg-white text-ink-700 hover:border-gold-500/60 hover:bg-cream-100'
                }`}
              >
                {isSelected ? `✓ ${city}` : `+ ${city}`}
              </button>
            )
          })}
        </div>
      </div>

      {/* Custom city */}
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Or type another custom city…"
          value={customCityInput}
          onChange={(event) => setCustomCityInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              handleAddCustomCity()
            }
          }}
          className="h-9 rounded-xl border-cream-300 text-xs"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddCustomCity}
          className="shrink-0 cursor-pointer rounded-xl border-cream-300 px-3 text-xs font-semibold"
        >
          <Plus className="size-3.5" aria-hidden />
          Add
        </Button>
      </div>
    </PanelModal>
  )
}
