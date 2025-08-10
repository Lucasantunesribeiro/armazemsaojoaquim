// Enhanced test to verify LocationButton component improvements
import React from 'react'
import LocationButton from './components/ui/LocationButton'

export default function TestLocationButton() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Testing Enhanced LocationButton</h1>
      
      {/* Test different variants */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Button Variants</h2>
        
        <div className="flex flex-wrap gap-4">
          <LocationButton 
            address="Rua São Joaquim, 138 - Lapa, Rio de Janeiro - RJ"
            variant="default" 
            size="lg"
            coordinates={{ lat: -22.9068, lng: -43.1729 }}
          >
            Default Variant
          </LocationButton>
          
          <LocationButton 
            address="Rua São Joaquim, 138 - Lapa, Rio de Janeiro - RJ"
            variant="outline" 
            size="lg"
            coordinates={{ lat: -22.9068, lng: -43.1729 }}
          >
            Outline Variant
          </LocationButton>
          
          <LocationButton 
            address="Rua São Joaquim, 138 - Lapa, Rio de Janeiro - RJ"
            variant="secondary" 
            size="lg"
            coordinates={{ lat: -22.9068, lng: -43.1729 }}
          >
            Secondary Variant
          </LocationButton>
          
          <LocationButton 
            address="Rua São Joaquim, 138 - Lapa, Rio de Janeiro - RJ"
            variant="ghost" 
            size="lg"
            coordinates={{ lat: -22.9068, lng: -43.1729 }}
          >
            Ghost Variant
          </LocationButton>
        </div>
      </div>
      
      {/* Test different sizes */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Button Sizes</h2>
        
        <div className="flex flex-wrap gap-4 items-center">
          <LocationButton 
            address="Rua São Joaquim, 138 - Lapa, Rio de Janeiro - RJ"
            variant="default" 
            size="sm"
            coordinates={{ lat: -22.9068, lng: -43.1729 }}
          >
            Small
          </LocationButton>
          
          <LocationButton 
            address="Rua São Joaquim, 138 - Lapa, Rio de Janeiro - RJ"
            variant="default" 
            size="default"
            coordinates={{ lat: -22.9068, lng: -43.1729 }}
          >
            Default
          </LocationButton>
          
          <LocationButton 
            address="Rua São Joaquim, 138 - Lapa, Rio de Janeiro - RJ"
            variant="default" 
            size="lg"
            coordinates={{ lat: -22.9068, lng: -43.1729 }}
          >
            Large
          </LocationButton>
        </div>
      </div>
      
      {/* Test in dark background to verify contrast */}
      <div className="bg-gray-900 p-6 rounded-lg space-y-4">
        <h2 className="text-lg font-semibold text-white">Dark Background Test</h2>
        
        <div className="flex flex-wrap gap-4">
          <LocationButton 
            address="Rua São Joaquim, 138 - Lapa, Rio de Janeiro - RJ"
            variant="default" 
            size="lg"
            coordinates={{ lat: -22.9068, lng: -43.1729 }}
          >
            Default on Dark
          </LocationButton>
          
          <LocationButton 
            address="Rua São Joaquim, 138 - Lapa, Rio de Janeiro - RJ"
            variant="outline" 
            size="lg"
            coordinates={{ lat: -22.9068, lng: -43.1729 }}
          >
            Outline on Dark
          </LocationButton>
        </div>
      </div>
    </div>
  )
}