'use client'

import { useState } from 'react'
import Toast, { ToastProps } from './Toast'

interface ToastItem extends ToastProps {
  id: string
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = (toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = Date.now().toString()
    const newToast: ToastItem = {
      ...toast,
      id,
      onClose: (id: string) => removeToast(id)
    }
    
    setToasts(prev => [...prev, newToast])
    return id
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  // Expose addToast function globally
  if (typeof window !== 'undefined') {
    (window as any).addToast = addToast
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-4">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  )
}

// Global toast function for easier usage
export const showToast = (title: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', message?: string, duration?: number) => {
  if (typeof window !== 'undefined' && (window as any).addToast) {
    return (window as any).addToast({ title, type, message, duration })
  }
}
