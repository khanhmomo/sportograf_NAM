'use client'

import { useState, useEffect } from 'react'
import { Calendar, Plane, Plus, Edit, Trash2, Eye, Search, Check } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface DashboardStats {
  totalEvents: number
  totalRegistrations: number
  pendingTravelForms: number
}

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

interface EventRegistration {
  _id: string
  name: string
  acronym: string
  email: string
  phoneNumber: string
  eventId: string
  event: {
    title: string
  }
  noted?: boolean
  notedAt?: Date
  hasTravelForm?: boolean
  createdAt: Date
}

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

export default function AdminPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [registrations, setRegistrations] = useState<EventRegistration[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [selectedRegistrations, setSelectedRegistrations] = useState<Set<string>>(new Set())
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>([])
  const [isEditingEvent, setIsEditingEvent] = useState(false)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    title: '',
    location: '',
    startDate: '',
    endDate: ''
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'events'>('events')

  useEffect(() => {
    // Check authentication first
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/auth/verify')
        if (!response.ok) {
          router.push('/admin/login')
          return
        }
      } catch (error) {
        router.push('/admin/login')
        return
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    fetchDashboardData()
    
    // Set up real-time polling for dashboard data
    const interval = setInterval(() => {
      fetchDashboardData()
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredEvents(events)
    } else {
      const filtered = events.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredEvents(filtered)
    }
  }, [searchTerm, events])

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, eventsResponse] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/events')
      ])

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json()
        setEvents(eventsData)
        setFilteredEvents(eventsData)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchDashboardData()
      }
    } catch (error) {
      console.error('Failed to delete event:', error)
    }
  }

  const fetchEventRegistrations = async (eventId: string) => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}/registrations`)
      if (response.ok) {
        const data = await response.json()
        setRegistrations(data)
        setSelectedEventId(eventId)
        // Initialize selected registrations from database noted status
        const notedIds = data.filter((reg: any) => reg.noted).map((reg: any) => reg._id)
        setSelectedRegistrations(new Set(notedIds))
      }
    } catch (error) {
      console.error('Failed to fetch registrations:', error)
    }
  }

  const toggleRegistrationSelection = async (registrationId: string) => {
    const isCurrentlySelected = selectedRegistrations.has(registrationId)
    
    // Update UI immediately for responsiveness
    setSelectedRegistrations(prev => {
      const newSet = new Set(prev)
      if (newSet.has(registrationId)) {
        newSet.delete(registrationId)
      } else {
        newSet.add(registrationId)
      }
      return newSet
    })

    // Save to database
    try {
      const response = await fetch(`/api/admin/registrations/${registrationId}/note`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          noted: !isCurrentlySelected 
        }),
      })

      if (!response.ok) {
        // Revert UI change if database update fails
        setSelectedRegistrations(prev => {
          const newSet = new Set(prev)
          if (isCurrentlySelected) {
            newSet.add(registrationId)
          } else {
            newSet.delete(registrationId)
          }
          return newSet
        })
        console.error('Failed to save selection to database')
      }
    } catch (error) {
      // Revert UI change if network error
      setSelectedRegistrations(prev => {
        const newSet = new Set(prev)
        if (isCurrentlySelected) {
          newSet.add(registrationId)
        } else {
          newSet.delete(registrationId)
        }
        return newSet
      })
      console.error('Failed to save selection:', error)
    }
  }

  const selectAllRegistrations = async () => {
    const allIds = registrations.map(reg => reg._id?.toString()).filter(Boolean)
    
    // Update UI immediately
    setSelectedRegistrations(new Set(allIds))
    
    // Save all to database
    try {
      const savePromises = allIds.map(id =>
        fetch(`/api/admin/registrations/${id}/note`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ noted: true }),
        })
      )
      
      await Promise.all(savePromises)
    } catch (error) {
      console.error('Failed to save all selections:', error)
    }
  }

  const deselectAllRegistrations = async () => {
    const allIds = registrations.map(reg => reg._id?.toString()).filter(Boolean)
    
    // Update UI immediately
    setSelectedRegistrations(new Set())
    
    // Remove all from database
    try {
      const savePromises = allIds.map(id =>
        fetch(`/api/admin/registrations/${id}/note`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ noted: false }),
        })
      )
      
      await Promise.all(savePromises)
    } catch (error) {
      console.error('Failed to remove all selections:', error)
    }
  }

  const deleteRegistration = async (registrationId: string) => {
    if (!confirm('Are you sure you want to delete this registration?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/registrations/${registrationId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove from UI
        setRegistrations(prev => prev.filter(reg => reg._id !== registrationId))
        setSelectedRegistrations(prev => {
          const newSet = new Set(prev)
          newSet.delete(registrationId)
          return newSet
        })
      } else {
        alert('Failed to delete registration')
      }
    } catch (error) {
      console.error('Failed to delete registration:', error)
      alert('Failed to delete registration')
    }
  }

  
  const openEditModal = (eventId: string) => {
    const event = events.find(e => e.id === eventId)
    if (event) {
      setEditForm({
        title: event.title,
        location: event.location || '',
        startDate: new Date(event.startDate).toISOString().split('T')[0],
        endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : ''
      })
      setEditingEventId(eventId)
    }
  }

  const closeEditModal = () => {
    setEditingEventId(null)
    setEditForm({
      title: '',
      location: '',
      startDate: '',
      endDate: ''
    })
  }

  const handleEditFormChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateEvent = async () => {
    if (!editingEventId) return
    
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/events/${editingEventId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editForm.title,
          location: editForm.location || null,
          startDate: editForm.startDate,
          endDate: editForm.endDate || null
        }),
      })

      if (response.ok) {
        fetchDashboardData()
        closeEditModal()
        alert('Event updated successfully!')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update event')
      }
    } catch (error) {
      console.error('Failed to update event:', error)
      alert('Failed to update event')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST'
      })
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout failed:', error)
      // Still redirect even if logout API fails
      router.push('/admin/login')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage events and registrations for Sportograf North America</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'events', label: 'Events', icon: Calendar },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Event Management</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search events..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 w-64"
                  />
                </div>
                <Link
                  href="/admin/events/create"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              {filteredEvents.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                  <p className="text-gray-600">
                    {searchTerm ? 'Try adjusting your search terms' : 'No events available'}
                  </p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registrations
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEvents.map((event) => (
                      <tr key={event.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{event.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {event.location || 'TBD'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {event.endDate 
                            ? `${format(new Date(event.startDate), 'MMM d')} - ${format(new Date(event.endDate), 'MMM d, yyyy')}`
                            : format(new Date(event.startDate), 'MMM d, yyyy')
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {event._count?.eventRegistrations || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => {
                            window.open(`/admin/travel-forms?eventId=${event.id}`, '_blank')
                          }}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
                        >
                          Travel Form
                        </button>
                        <button
                          onClick={() => fetchEventRegistrations(event.id)}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200"
                        >
                          Request
                        </button>
                        <button
                          onClick={() => openEditModal(event.id)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteEvent(event.id)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              )}
            </div>

          {/* Registration Modal */}
          {selectedEventId && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Event Requests - {events.find(e => e.id === selectedEventId)?.title}
                  </h3>
                  <button
                    onClick={() => setSelectedEventId(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
                
                {/* Modal Content */}
                <div className="overflow-y-auto">
                  {registrations.length === 0 ? (
                    <div className="p-6 text-center">
                      <div className="text-gray-500">No requests yet</div>
                    </div>
                  ) : (
                    <>
                      {/* Selection Controls */}
                      <div className="border-b border-gray-200 p-4 bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={selectAllRegistrations}
                              className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                            >
                              Select All
                            </button>
                            <button
                              onClick={deselectAllRegistrations}
                              className="text-sm bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                            >
                              Deselect All
                            </button>
                            <span className="text-sm text-gray-600">
                              {selectedRegistrations.size} of {registrations.length} selected
                            </span>
                          </div>
                                                  </div>
                      </div>
                      
                      {/* Registrations List */}
                      <div className="divide-y divide-gray-200">
                        {registrations.map((registration) => (
                          <div key={registration._id} className="p-4 hover:bg-gray-50">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={selectedRegistrations.has(registration._id)}
                                onChange={() => toggleRegistrationSelection(registration._id)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <div className="ml-4 flex-1">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {registration.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {registration.acronym} • {registration.email} • {registration.phoneNumber}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-4">
                                    <div className="text-sm text-gray-500">
                                      Registered: {new Date(registration.createdAt).toLocaleDateString()}
                                    </div>
                                    <button
                                      onClick={() => deleteRegistration(registration._id)}
                                      className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                
                {/* Modal Footer */}
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="flex justify-end">
                    <button
                      onClick={() => setSelectedEventId(null)}
                      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Event Modal */}
          {editingEventId && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Edit Event - {events.find(e => e.id === editingEventId)?.title}
                  </h3>
                  <button
                    onClick={closeEditModal}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
                
                {/* Modal Content */}
                <div className="p-6">
                  <form className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Event Title *
                      </label>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => handleEditFormChange('title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="Event title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={editForm.location}
                        onChange={(e) => handleEditFormChange('location', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="Event location"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Date *
                        </label>
                        <input
                          type="date"
                          value={editForm.startDate}
                          onChange={(e) => handleEditFormChange('startDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Date (Optional)
                        </label>
                        <input
                          type="date"
                          value={editForm.endDate}
                          onChange={(e) => handleEditFormChange('endDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                      </div>
                    </div>
                  </form>
                </div>
                
                {/* Modal Footer */}
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={closeEditModal}
                      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={updateEvent}
                      disabled={isUpdating}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? 'Updating...' : 'Update Event'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        )}

              </div>
    </div>
  )
}
