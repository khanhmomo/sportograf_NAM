'use client'

import { useState, useEffect } from 'react'
import { Calendar, MapPin, Users, Clock, Send, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/hooks/useToast'

interface Event {
  id: string
  title: string
  description?: string
  location?: string
  startDate: Date
  endDate?: Date
  maxCapacity?: number
  isActive: boolean
  _count?: {
    eventRegistrations: number
  }
}

interface UserInfo {
  name: string
  acronym: string
  email: string
  phoneNumber: string
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set())
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    acronym: '',
    email: '',
    phoneNumber: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      if (response.ok) {
        const data = await response.json()
        // Sort events by start date in ascending order
        const sortedEvents = data.sort((a: Event, b: Event) => 
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        )
        setEvents(sortedEvents)
      }
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEventSelection = (eventId: string) => {
    setSelectedEvents(prev => {
      const newSet = new Set(prev)
      if (newSet.has(eventId)) {
        newSet.delete(eventId)
      } else {
        newSet.add(eventId)
      }
      return newSet
    })
  }

  const handleUserInfoChange = (field: keyof UserInfo, value: string) => {
    setUserInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  
  const handleShowConfirmation = () => {
    // Validate user info
    if (!userInfo.name || !userInfo.email || !userInfo.phoneNumber) {
      showToast({
        title: 'Missing Information',
        message: 'Please fill in all required fields (Name, Email, Phone Number)',
        type: 'warning'
      })
      return
    }

    if (selectedEvents.size === 0) {
      showToast({
        title: 'No Events Selected',
        message: 'Please select at least one event',
        type: 'warning'
      })
      return
    }

    setShowConfirmation(true)
  }

  const handleSubmitRequests = async () => {
    setShowConfirmation(false)
    
    if (selectedEvents.size === 0) {
      setIsSubmitting(false)
      return
    }

    setIsSubmitting(true)
    try {
      // Check for existing requests first
      const checkPromises = Array.from(selectedEvents).map(eventId =>
        fetch(`/api/events/check-request`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            eventId,
            email: userInfo.email,
            acronym: userInfo.acronym
          }),
        })
      )

      const checkResults = await Promise.allSettled(checkPromises)
      const existingRequests: any[] = []
      const newEventIds: string[] = []

      for (let i = 0; i < checkResults.length; i++) {
        const result = checkResults[i]
        const eventId = Array.from(selectedEvents)[i]
        
        if (result.status === 'fulfilled') {
          const response = await result.value.json()
          if (response.exists) {
            existingRequests.push({
              eventId,
              event: events.find(e => e.id === eventId)
            })
          } else {
            newEventIds.push(eventId)
          }
        } else {
          newEventIds.push(eventId)
        }
      }

      if (existingRequests.length > 0) {
        // Show over-request toast
        const eventList = existingRequests.map(req => req.event?.title || 'Unknown Event')
        
        showToast({
          title: 'Event Already Requested',
          message: 'Already requested that event and we already handling your request.',
          type: 'warning',
          eventList
        })
        
        // Only submit new requests
        if (newEventIds.length === 0) {
          setIsSubmitting(false)
          return
        }
      }

      // Request registration for new events only
      const requestPromises = newEventIds.map(eventId =>
        fetch('/api/events/request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            eventId,
            userInfo // Send user info with request
          }),
        })
      )

      const results = await Promise.allSettled(requestPromises)
      
      // Check if any requests failed
      const failures = results.filter(result => result.status === 'rejected')
      if (failures.length > 0) {
        showToast({
          title: 'Request Failed',
          message: `Some requests failed. ${failures.length} out of ${newEventIds.length} events were not requested.`,
          type: 'error'
        })
      } else {
        const message = existingRequests.length > 0 
          ? `Successfully requested ${newEventIds.length} new event(s)! ${existingRequests.length} event(s) were already requested. Your requests are pending admin approval.`
          : `Successfully requested ${newEventIds.length} event(s)! Your requests are pending admin approval.`
        showToast({
          title: 'Request Successful',
          message,
          type: 'success'
        })
        setSelectedEvents(new Set())
      }
    } catch (error) {
      console.error('Request failed:', error)
      showToast({
        title: 'Request Failed',
        message: 'Failed to request events. Please try again.',
        type: 'error'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading events...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Available Events</h1>
          <p className="text-gray-600">Browse and request participation in upcoming Sportograf North America events</p>
        </div>

        {/* User Information Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={userInfo.name}
                onChange={(e) => handleUserInfoChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Acronym
              </label>
              <input
                type="text"
                value={userInfo.acronym}
                onChange={(e) => handleUserInfoChange('acronym', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                placeholder="e.g., J.D."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={userInfo.email}
                onChange={(e) => handleUserInfoChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={userInfo.phoneNumber}
                onChange={(e) => handleUserInfoChange('phoneNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events available</h3>
            <p className="text-gray-600">Check back later for new events</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Select
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedEvents.has(event.id)}
                          onChange={() => handleEventSelection(event.id)}
                          className="h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{event.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {format(new Date(event.startDate), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {event.endDate ? format(new Date(event.endDate), 'MMM d, yyyy') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {event.location || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-gray-200">
              {events.map((event) => (
                <div key={event.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 mb-1 pr-2">
                        {event.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(event.startDate), 'MMM d, yyyy')}
                        </div>
                        {event.endDate && (
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {format(new Date(event.endDate), 'MMM d, yyyy')}
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-2">
                      <input
                        type="checkbox"
                        checked={selectedEvents.has(event.id)}
                        onChange={() => handleEventSelection(event.id)}
                        className="h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        {events.length > 0 && (
          <div className="mt-6 flex justify-between items-center bg-white rounded-lg shadow-lg p-6">
            <div className="text-sm text-gray-600">
              {selectedEvents.size > 0 
                ? `Selected ${selectedEvents.size} event${selectedEvents.size > 1 ? 's' : ''}`
                : 'No events selected'
              }
            </div>
            <button
              onClick={handleShowConfirmation}
              disabled={isSubmitting || selectedEvents.size === 0}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isSubmitting || selectedEvents.size === 0
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? 'Submitting...' : `Request ${selectedEvents.size} Event${selectedEvents.size !== 1 ? 's' : ''}`}
            </button>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center p-2 md:p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] md:max-h-[80vh] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200">
                <h3 className="text-base md:text-xl font-semibold text-gray-900 truncate pr-4">Confirm Event Requests</h3>
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl md:text-3xl p-2 flex-shrink-0"
                >
                  ×
                </button>
              </div>
              
              <div className="overflow-y-auto p-4 md:p-6 flex-1">
                <div className="space-y-4 md:space-y-6">
                  {/* User Information Summary */}
                  <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 md:mb-3">Your Information</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Name:</span>
                        <span className="ml-2 font-medium text-gray-900">{userInfo.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Acronym:</span>
                        <span className="ml-2 font-medium text-gray-900">{userInfo.acronym || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Email:</span>
                        <span className="ml-2 font-medium text-gray-900 break-all">{userInfo.email}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Phone:</span>
                        <span className="ml-2 font-medium text-gray-900">{userInfo.phoneNumber}</span>
                      </div>
                    </div>
                  </div>

                  {/* Selected Events */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 md:mb-3">
                      Selected Events ({selectedEvents.size})
                    </h4>
                    <div className="space-y-2">
                      {Array.from(selectedEvents).map(eventId => {
                        const event = events.find(e => e.id === eventId)
                        if (!event) return null
                        return (
                          <div key={eventId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 text-sm md:text-base">{event.title}</div>
                              <div className="text-xs text-gray-600 mt-1 flex flex-wrap items-center gap-2 md:gap-3">
                                <div className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {format(new Date(event.startDate), 'MMM d, yyyy')}
                                </div>
                                {event.location && (
                                  <div className="flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {event.location}
                                  </div>
                                )}
                              </div>
                            </div>
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 ml-3" />
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Warning */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:p-4">
                    <p className="text-xs md:text-sm text-yellow-800">
                      <strong>Important:</strong> Your requests will be submitted to the admin for approval. 
                      Once approved, you will be notified and can complete your travel arrangements.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 p-3 md:p-4 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-3 gap-3">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm md:text-sm font-medium w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitRequests}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-sm font-medium w-full sm:w-auto"
                  >
                    {isSubmitting ? 'Submitting...' : 'Confirm Request'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
