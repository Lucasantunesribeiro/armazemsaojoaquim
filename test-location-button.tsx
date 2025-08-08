// Simple test to verify LocationButton component
import React from 'react'
import LocationButton from './components/ui/LocationButton'

export default function TestLocationButton() {
  return (
    <div>
      <h1>Testing LocationButton</h1>
      <LocationButton 
        variant="outline" 
        size="lg"
        className="border-white text-white hover:bg-white hover:text-slate-900 px-8 py-3"
        address="Rua São Joaquim, 138 - Lapa, Rio de Janeiro - RJ"
        coordinates={{ lat: -22.9068, lng: -43.1729 }}
      >
        Ver Localização
      </LocationButton>
    </div>
  )
}