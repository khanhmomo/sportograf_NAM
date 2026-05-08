'use client'

import { useEffect, useRef } from 'react'

export interface ToastOptions {
  title: string
  type: 'success' | 'error' | 'warning' | 'info'
  message?: string
  duration?: number
  eventList?: string[]
}

export function useToast() {
  const toastRef = useRef<{
    addToast: (options: ToastOptions) => string
  }>(null as any)

  useEffect(() => {
    // Wait for ToastContainer to be ready
    const checkToast = () => {
      if (typeof window !== 'undefined' && (window as any).addToast) {
        toastRef.current = {
          addToast: (options: ToastOptions) => {
            const { title, type, message, duration, eventList } = options
            
            // Format message with event list if provided
            let formattedMessage = message
            if (eventList && eventList.length > 0) {
              const eventListText = eventList.map(event => `• ${event}`).join('\n')
              formattedMessage = `${message}\n\nPreviously requested events:\n${eventListText}`
            }
            
            return (window as any).addToast({
              title,
              type,
              message: formattedMessage,
              duration: duration || (eventList?.length ? 8000 : 5000) // Longer duration for event lists
            })
          }
        }
      } else {
        setTimeout(checkToast, 100)
      }
    }
    
    checkToast()
  }, [])

  const showToast = (options: ToastOptions) => {
    if (toastRef.current) {
      return toastRef.current.addToast(options)
    }
  }

  return { showToast }
}
