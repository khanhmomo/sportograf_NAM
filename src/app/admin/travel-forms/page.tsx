'use client'

import { useState, useEffect, Suspense } from 'react'
import { Plane, Car, Train, Calendar, MapPin, User, Mail, Phone } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

interface TravelForm {
  id: string
  name: string
  acronym: string
  email: string
  phoneNumber: string
  eventId: string
  eventTitle: string
  travelMethod: string
  // Flight specific
  arrivalFromEventFlightNumber?: string
  arrivalFromEventDepartureAirport?: string
  arrivalFromEventArrivalAirport?: string
  arrivalFromEventDepartureDate?: string
  arrivalFromEventDepartureTime?: string
  arrivalFromEventArrivalDate?: string
  arrivalFromEventArrivalTime?: string
  departureFromEventFlightNumber?: string
  departureFromEventDepartureAirport?: string
  departureFromEventArrivalAirport?: string
  departureFromEventDepartureDate?: string
  departureFromEventDepartureTime?: string
  departureFromEventArrivalDate?: string
  departureFromEventArrivalTime?: string
  // Car specific
  drivingFrom?: string
  expectedMiles?: string
  // Bus specific
  arrivalStation?: string
  departureStation?: string
  busArrivalDate?: string
  busArrivalTime?: string
  busDepartureDate?: string
  busDepartureTime?: string
  // Accommodation
  accommodationNeeded?: string
  checkInDate?: string
  checkOutDate?: string
  specialRequests?: string
  status: string
  createdAt: string
  updatedAt: string
}

interface Event {
  id: string
  title: string
  startDate: string
  endDate: string
  location: string
}

function TravelFormsPageContent() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId')
  
  const [travelForms, setTravelForms] = useState<TravelForm[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [selectedForm, setSelectedForm] = useState<TravelForm | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    fetchData()
    
    // Set up real-time polling for travel forms
    const interval = setInterval(() => {
      fetchTravelForms()
    }, 3000) // Poll every 3 seconds for more responsive updates

    return () => clearInterval(interval)
  }, [eventId])

  const fetchTravelForms = async () => {
    try {
      const travelResponse = await fetch('/api/admin/travel-forms')
      if (travelResponse.ok) {
        const travelData = await travelResponse.json()
        
        // Filter by event if eventId is provided
        const filteredForms = eventId 
          ? travelData.filter((form: TravelForm) => form.eventId === eventId)
          : travelData
          
        setTravelForms(filteredForms)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Failed to fetch travel forms:', error)
    }
  }

  const fetchData = async () => {
    try {
      // Fetch events
      const eventsResponse = await fetch('/api/events')
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json()
        setEvents(eventsData)
        
        if (eventId) {
          const event = eventsData.find((e: Event) => e.id === eventId)
          setSelectedEvent(event || null)
        }
      }

      // Fetch travel forms
      await fetchTravelForms()
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteTravelForm = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this travel form?')) return

    try {
      const response = await fetch(`/api/admin/travel-forms?id=${formId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Immediately remove the form from the local state for instant UI update
        setTravelForms(prev => prev.filter(form => form.id !== formId))
        
        // Close the detail modal if the deleted form was selected
        if (selectedForm?.id === formId) {
          setSelectedForm(null)
        }
        
        // Also refresh from server to ensure consistency
        await fetchTravelForms()
        
        // Update the last updated time for real-time indicator
        setLastUpdated(new Date())
      } else {
        console.error('Failed to delete travel form')
      }
    } catch (error) {
      console.error('Failed to delete travel form:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading travel forms...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-2">Travel Forms</h1>
              {selectedEvent ? (
                <div className="flex flex-col sm:flex-row sm:items-center text-gray-600 text-sm md:text-base gap-1 sm:gap-2">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="font-medium">{selectedEvent.title}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{selectedEvent.location}</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-sm md:text-base">All travel form submissions</p>
              )}
            </div>
            <div className="flex items-center space-x-2 text-xs md:text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live</span>
              <span>•</span>
              <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Event Filter */}
        {!eventId && (
          <div className="mb-4 md:mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Event
            </label>
            <select
              onChange={(e) => {
                const event = events.find(ev => ev.id === e.target.value)
                setSelectedEvent(event || null)
                if (event) {
                  // Filter travel forms by selected event
                  fetch(`/api/admin/travel-forms`)
                    .then(res => res.json())
                    .then(data => {
                      const filtered = data.filter((form: TravelForm) => form.eventId === event.id)
                      setTravelForms(filtered)
                    })
                } else {
                  // Show all travel forms
                  fetch(`/api/admin/travel-forms`)
                    .then(res => res.json())
                    .then(setTravelForms)
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            >
              <option value="">All Events</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Travel Forms List */}
        {travelForms.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 md:p-8 text-center">
            <Plane className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">No travel forms found</h3>
            <p className="text-sm md:text-base text-gray-600">
              {selectedEvent ? `No travel forms submitted for ${selectedEvent.title}` : 'No travel form submissions yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {travelForms.map((form) => (
              <div key={form.id} className="bg-white rounded-lg shadow p-4 md:p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 truncate">{form.name}</h3>
                    <div className="flex flex-wrap items-center text-xs md:text-sm text-gray-600 mt-1 gap-2">
                      <div className="flex items-center">
                        <Mail className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1" />
                        <span className="truncate max-w-[150px] md:max-w-[200px]">{form.email}</span>
                      </div>
                      <span className="hidden md:inline">•</span>
                      <div className="flex items-center">
                        <Phone className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1" />
                        {form.phoneNumber}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <button
                      onClick={() => setSelectedForm(form)}
                      className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => deleteTravelForm(form.id)}
                      className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Travel Method Summary */}
                <div className="flex items-center text-xs md:text-sm text-gray-600 mb-3 flex-wrap gap-2">
                  <div className="flex items-center">
                    {form.travelMethod === 'flight' && <Plane className="h-4 w-4 mr-2" />}
                    {form.travelMethod === 'car' && <Car className="h-4 w-4 mr-2" />}
                    {form.travelMethod === 'bus' && <Train className="h-4 w-4 mr-2" />}
                    <span className="capitalize">{form.travelMethod}</span>
                  </div>
                  {form.accommodationNeeded === 'yes' && (
                    <span className="text-blue-600">• Accommodation needed</span>
                  )}
                </div>

                {/* Accommodation summary when needed */}
                {form.accommodationNeeded === 'yes' && (
                  <div className="text-xs md:text-sm text-gray-600">
                    <div>Check-in: {form.checkInDate || 'N/A'}</div>
                    <div>Check-out: {form.checkOutDate || 'N/A'}</div>
                  </div>
                )}
                {/* Method-specific summary when no accommodation needed */}
                {form.accommodationNeeded !== 'yes' && form.travelMethod === 'flight' && (
                  <div className="text-xs md:text-sm text-gray-600">
                    <div>Flight: {form.arrivalFromEventFlightNumber || 'N/A'}</div>
                    <div className="truncate">Route: {form.arrivalFromEventDepartureAirport || 'N/A'} → {form.arrivalFromEventArrivalAirport || 'N/A'}</div>
                  </div>
                )}
                {form.accommodationNeeded !== 'yes' && form.travelMethod === 'car' && (
                  <div className="text-xs md:text-sm text-gray-600">
                    <div>From: {form.drivingFrom || 'N/A'}</div>
                    <div>Distance: {form.expectedMiles || 'N/A'} miles</div>
                  </div>
                )}
                {form.accommodationNeeded !== 'yes' && form.travelMethod === 'bus' && (
                  <div className="text-xs md:text-sm text-gray-600">
                    <div className="truncate">Route: {form.arrivalStation || 'N/A'} → {form.departureStation || 'N/A'}</div>
                  </div>
                )}

                {/* Special Requests */}
                {form.specialRequests && (
                  <div className="mt-3 text-xs md:text-sm text-gray-600">
                    <strong>Special Requests:</strong> {form.specialRequests}
                  </div>
                )}

                <div className="mt-3 text-xs text-gray-500">
                  Submitted: {new Date(form.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedForm && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center p-2 md:p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] md:max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900">Travel Form Details</h3>
                <button
                  onClick={() => setSelectedForm(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl md:text-3xl p-2"
                >
                  ×
                </button>
              </div>
              
              {/* Modal Content */}
              <div className="overflow-y-auto p-4 md:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                  {/* Left Panel - Main Information (2 columns) */}
                  <div className="lg:col-span-2 space-y-4 md:space-y-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Personal Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="font-medium text-gray-900">Name:</span> <span className="text-gray-900">{selectedForm.name}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium text-gray-900 ml-6">Acronym:</span> <span className="text-gray-900">{selectedForm.acronym}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="font-medium text-gray-900">Email:</span> <span className="text-gray-900">{selectedForm.email}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="font-medium text-gray-900">Phone:</span> <span className="text-gray-900">{selectedForm.phoneNumber}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Event Information */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Event Information</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="font-medium text-gray-900">Event:</span> <span className="text-gray-900">{selectedForm.eventTitle}</span>
                        </div>
                        <div className="flex items-center">
                          {selectedForm.travelMethod === 'flight' && <Plane className="h-4 w-4 mr-2 text-gray-400" />}
                          {selectedForm.travelMethod === 'car' && <Car className="h-4 w-4 mr-2 text-gray-400" />}
                          {selectedForm.travelMethod === 'bus' && <Train className="h-4 w-4 mr-2 text-gray-400" />}
                          <span className="font-medium text-gray-900">Travel Method:</span> <span className="text-gray-900">{selectedForm.travelMethod}</span>
                        </div>
                      </div>
                    </div>

                    {/* Travel Details */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Travel Details</h4>
                      
                      {selectedForm.travelMethod === 'flight' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="font-medium text-gray-700 mb-2">Arrival Before Event</h5>
                              <div className="space-y-1 text-sm">
                                <div><strong className="text-gray-900">Flight Number:</strong> <span className="text-gray-900">{selectedForm.arrivalFromEventFlightNumber || 'N/A'}</span></div>
                                <div><strong className="text-gray-900">Departure Airport:</strong> <span className="text-gray-900">{selectedForm.arrivalFromEventDepartureAirport || 'N/A'}</span></div>
                                <div><strong className="text-gray-900">Arrival Airport:</strong> <span className="text-gray-900">{selectedForm.arrivalFromEventArrivalAirport || 'N/A'}</span></div>
                                <div><strong className="text-gray-900">Departure Date:</strong> <span className="text-gray-900">{selectedForm.arrivalFromEventDepartureDate || 'N/A'}</span></div>
                                <div><strong className="text-gray-900">Departure Time:</strong> <span className="text-gray-900">{selectedForm.arrivalFromEventDepartureTime || 'N/A'}</span></div>
                                <div><strong className="text-gray-900">Arrival Date:</strong> <span className="text-gray-900">{selectedForm.arrivalFromEventArrivalDate || 'N/A'}</span></div>
                                <div><strong className="text-gray-900">Arrival Time:</strong> <span className="text-gray-900">{selectedForm.arrivalFromEventArrivalTime || 'N/A'}</span></div>
                              </div>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-700 mb-2">Departure After Event</h5>
                              <div className="space-y-1 text-sm">
                                <div><strong className="text-gray-900">Flight Number:</strong> <span className="text-gray-900">{selectedForm.departureFromEventFlightNumber || 'N/A'}</span></div>
                                <div><strong className="text-gray-900">Departure Airport:</strong> <span className="text-gray-900">{selectedForm.departureFromEventDepartureAirport || 'N/A'}</span></div>
                                <div><strong className="text-gray-900">Arrival Airport:</strong> <span className="text-gray-900">{selectedForm.departureFromEventArrivalAirport || 'N/A'}</span></div>
                                <div><strong className="text-gray-900">Departure Date:</strong> <span className="text-gray-900">{selectedForm.departureFromEventDepartureDate || 'N/A'}</span></div>
                                <div><strong className="text-gray-900">Departure Time:</strong> <span className="text-gray-900">{selectedForm.departureFromEventDepartureTime || 'N/A'}</span></div>
                                <div><strong className="text-gray-900">Arrival Date:</strong> <span className="text-gray-900">{selectedForm.departureFromEventArrivalDate || 'N/A'}</span></div>
                                <div><strong className="text-gray-900">Arrival Time:</strong> <span className="text-gray-900">{selectedForm.departureFromEventArrivalTime || 'N/A'}</span></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedForm.travelMethod === 'car' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="space-y-1 text-sm">
                              <div><strong className="text-gray-900">Driving From:</strong> <span className="text-gray-900">{selectedForm.drivingFrom || 'N/A'}</span></div>
                              <div><strong className="text-gray-900">Expected Miles:</strong> <span className="text-gray-900">{selectedForm.expectedMiles || 'N/A'}</span></div>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedForm.travelMethod === 'bus' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-gray-700 mb-2">Arrival</h5>
                            <div className="space-y-1 text-sm">
                              <div><strong className="text-gray-900">Station:</strong> <span className="text-gray-900">{selectedForm.arrivalStation || 'N/A'}</span></div>
                              <div><strong className="text-gray-900">Date:</strong> <span className="text-gray-900">{selectedForm.busArrivalDate || 'N/A'}</span></div>
                              <div><strong className="text-gray-900">Time:</strong> <span className="text-gray-900">{selectedForm.busArrivalTime || 'N/A'}</span></div>
                            </div>
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-700 mb-2">Departure</h5>
                            <div className="space-y-1 text-sm">
                              <div><strong className="text-gray-900">Station:</strong> <span className="text-gray-900">{selectedForm.departureStation || 'N/A'}</span></div>
                              <div><strong className="text-gray-900">Date:</strong> <span className="text-gray-900">{selectedForm.busDepartureDate || 'N/A'}</span></div>
                              <div><strong className="text-gray-900">Time:</strong> <span className="text-gray-900">{selectedForm.busDepartureTime || 'N/A'}</span></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Accommodation */}
                    {selectedForm.accommodationNeeded === 'yes' && (
                      <div className="space-y-4">
                        <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Accommodation</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="text-sm">
                            <div><strong className="text-gray-900">Check-in Date:</strong> <span className="text-gray-900">{selectedForm.checkInDate || 'N/A'}</span></div>
                            <div><strong className="text-gray-900">Check-out Date:</strong> <span className="text-gray-900">{selectedForm.checkOutDate || 'N/A'}</span></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Panel - Special Requests (1 column) */}
                  <div className="lg:col-span-1">
                    <div className="sticky top-2 md:top-6 space-y-3 md:space-y-4">
                      {/* Special Requests - Enhanced UI */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
                        <div className="flex items-start space-x-2 md:space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-7 h-7 md:w-8 md:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h5 className="text-xs md:text-sm font-semibold text-blue-900 mb-1 md:mb-2">Special Requests</h5>
                            <div className="text-xs md:text-sm text-blue-800 leading-relaxed">
                              {selectedForm.specialRequests ? (
                                <div className="whitespace-pre-wrap">{selectedForm.specialRequests}</div>
                              ) : (
                                <span className="text-blue-600 italic">No special requests provided</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Submission Info */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 md:p-4">
                        <div className="flex items-center space-x-2 text-xs md:text-sm text-gray-600">
                          <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium">Submitted:</span>
                          <span className="text-gray-900">{new Date(selectedForm.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TravelFormsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading travel forms...</div>
      </div>
    }>
      <TravelFormsPageContent />
    </Suspense>
  )
}
