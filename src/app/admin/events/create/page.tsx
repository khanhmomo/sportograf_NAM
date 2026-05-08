'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Calendar, MapPin, Users, ArrowLeft, Plus, Trash2, Plane } from 'lucide-react'
import Link from 'next/link'
import ImageUpload from '@/components/ImageUpload'

const eventFormSchema = z.object({
  title: z.string().min(1, 'Event title is required'),
  location: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
})

type EventFormData = z.infer<typeof eventFormSchema>

interface SuggestedFlight {
  from: string
  to: string
  price: string
  budgetAllow: string
  link: string
  screenshot?: string
}

export default function CreateEventPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [suggestedFlights, setSuggestedFlights] = useState<SuggestedFlight[]>([
    { from: '', to: '', price: '', budgetAllow: '', link: '' }
  ])
  const [activeFlightIndex, setActiveFlightIndex] = useState<number | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
  })

  const addSuggestedFlight = () => {
    setSuggestedFlights([...suggestedFlights, { from: '', to: '', price: '', budgetAllow: '', link: '' }])
  }

  const removeSuggestedFlight = (index: number) => {
    const newFlights = suggestedFlights.filter((_, i) => i !== index)
    setSuggestedFlights(newFlights.length > 0 ? newFlights : [{ from: '', to: '', price: '', budgetAllow: '', link: '' }])
  }

  const handleRowPaste = async (e: React.ClipboardEvent, index: number) => {
    const items = e.clipboardData?.items
    if (items) {
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) {
            e.preventDefault()
            await uploadImageToFlight(file, index)
            break
          }
        }
      }
    }
  }

  const handleTablePaste = async (e: React.ClipboardEvent) => {
    if (activeFlightIndex !== null) {
      await handleRowPaste(e, activeFlightIndex)
    }
  }

  const uploadImageToFlight = async (file: File, index: number) => {
    try {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onloadend = async () => {
        const base64data = reader.result as string
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            file: base64data,
            folder: 'flight-screenshots',
          }),
        })

        if (response.ok) {
          const data = await response.json()
          updateSuggestedFlight(index, 'screenshot', data.url)
        } else {
          const error = await response.json()
          console.error('Upload failed:', error.error)
          alert(`Upload failed: ${error.error}`)
        }
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload error occurred')
    }
  }

  const updateSuggestedFlight = (index: number, field: keyof SuggestedFlight, value: string) => {
    const newFlights = [...suggestedFlights]
    newFlights[index][field] = value
    setSuggestedFlights(newFlights)
  }

  const onSubmit = async (data: EventFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          suggestedFlights: suggestedFlights.filter(f => f.from && f.to),
        }),
      })

      if (response.ok) {
        router.push('/admin?tab=events')
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to create event')
      }
    } catch (error) {
      console.error('Creation failed:', error)
      alert('Failed to create event')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Link
              href="/admin?tab=events"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Event</h1>
            <p className="text-gray-600">Add a new Sportograf North America event for crew members to register for</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  {...register('title')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                  placeholder="e.g., Annual Company Meeting"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Location
                </label>
                <input
                  type="text"
                  {...register('location')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                  placeholder="e.g., Conference Room A, Main Office"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Start Date *
                  </label>
                  <input
                    type="date"
                    {...register('startDate')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.startDate.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    {...register('endDate')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
              </div>

              {/* Suggested Flights */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Plane className="h-5 w-5 mr-2" />
                    Suggested Flights
                  </h3>
                  <button
                    type="button"
                    onClick={addSuggestedFlight}
                    className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Flight
                  </button>
                </div>

                {suggestedFlights.length > 0 && (
                  <div className="overflow-x-auto" onPaste={handleTablePaste}>
                    <table className="min-w-full border border-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">From</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">To</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Price (€)</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Budget Allow</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Booking Link</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Screenshot</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {suggestedFlights.map((flight, index) => (
                          <tr 
                            key={index} 
                            onClick={() => setActiveFlightIndex(index)}
                            className={activeFlightIndex === index ? 'bg-blue-50 cursor-pointer' : 'cursor-pointer hover:bg-gray-50'}
                          >
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={flight.from}
                                onChange={(e) => updateSuggestedFlight(index, 'from', e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                                placeholder="e.g., JFK"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={flight.to}
                                onChange={(e) => updateSuggestedFlight(index, 'to', e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                                placeholder="e.g., LAX"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={flight.price}
                                onChange={(e) => updateSuggestedFlight(index, 'price', e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                                placeholder="e.g., 450"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={flight.budgetAllow}
                                onChange={(e) => updateSuggestedFlight(index, 'budgetAllow', e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                                placeholder="e.g., 500"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={flight.link}
                                onChange={(e) => updateSuggestedFlight(index, 'link', e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                                placeholder="https://..."
                              />
                            </td>
                            <td className="px-3 py-2">
                              <ImageUpload
                                value={flight.screenshot}
                                onChange={(url) => updateSuggestedFlight(index, 'screenshot', url)}
                                placeholder="Upload"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <button
                                type="button"
                                onClick={() => removeSuggestedFlight(index)}
                                className="text-red-600 hover:text-red-900 hover:bg-red-50 p-1 rounded"
                                title="Remove flight"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <Link
                  href="/admin?tab=events"
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
