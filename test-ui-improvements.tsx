// Simple test page to verify UI improvements work
import React from 'react'
import { ToastProvider } from './contexts/ToastContext'
import ToastContainer from './components/ui/ToastContainer'
import LocationButton from './components/ui/LocationButton'
import { useToastNotifications } from './hooks/useToastNotifications'

function TestContent() {
  const { showSuccess, showError, showLocationSuccess } = useToastNotifications()

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">UI Improvements Test</h1>
      
      {/* LocationButton Tests */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Enhanced LocationButton</h2>
        
        <div className="flex flex-wrap gap-4">
          <LocationButton 
            variant="default"
            size="lg"
            onClick={() => showLocationSuccess()}
          >
            Test Location (Success)
          </LocationButton>
          
          <LocationButton 
            variant="outline"
            size="lg"
            onClick={() => showError('Location error test', 'Error')}
          >
            Test Location (Error)
          </LocationButton>
          
          <LocationButton 
            variant="secondary"
            size="lg"
          >
            Default Behavior
          </LocationButton>
        </div>
      </section>

      {/* Toast Tests */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Toast Notifications</h2>
        
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => showSuccess('Success message!', 'Success')}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Show Success Toast
          </button>
          
          <button 
            onClick={() => showError('Error message!', 'Error')}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Show Error Toast
          </button>
        </div>
      </section>

      {/* Toast Container */}
      <ToastContainer position="top-right" />
    </div>
  )
}

export default function TestUIImprovements() {
  return (
    <ToastProvider>
      <TestContent />
    </ToastProvider>
  )
}