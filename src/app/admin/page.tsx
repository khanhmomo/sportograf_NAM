'use client'

import { useState, useEffect } from 'react'
import { Calendar, Plane, Plus, Edit, Trash2, Eye, Search, Check, Users, MapPin } from 'lucide-react'
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
  location?: string
  startDate: Date
  endDate?: Date
  isActive: boolean
  _count?: {
    eventRegistrations: number
    travelForms: number
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

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    totalRegistrations: 0,
    pendingTravelForms: 0
  })
  const [events, setEvents] = useState<Event[]>([])
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
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch events
      const eventsResponse = await fetch('/api/events')
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json()
        setEvents(eventsData)
      }

      // Fetch registrations
      const registrationsResponse = await fetch('/api/admin/registrations')
      if (registrationsResponse.ok) {
        const registrationsData = await registrationsResponse.json()
        setRegistrations(registrationsData)
      }

      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      setLoading(false)
    }
  }

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This will also delete all registrations and travel forms for this event.')) return

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
      console.error('Failed to fetch event registrations:', error)
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

  const openEditModal = (eventId: string) => {
    const event = events.find(e => e.id === eventId)
    if (event) {
      setEditingEventId(eventId)
      setEditForm({
        title: event.title,
        location: event.location || '',
        startDate: format(new Date(event.startDate), 'yyyy-MM-dd'),
        endDate: event.endDate ? format(new Date(event.endDate), 'yyyy-MM-dd') : ''
      })
      setIsEditingEvent(true)
    }
  }

  const closeEditModal = () => {
    setIsEditingEvent(false)
    setEditingEventId(null)
    setEditForm({ title: '', location: '', startDate: '', endDate: '' })
  }

  const handleEditFormChange = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
  }

  const updateEvent = async () => {
    if (!editingEventId) return

    try {
      setIsUpdating(true)
      const response = await fetch(`/api/admin/events/${editingEventId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        fetchDashboardData()
        closeEditModal()
      }
    } catch (error) {
      console.error('Failed to update event:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleLogout = () => {
    document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    router.push('/admin/login')
  }

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()))
  )

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
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-sm md:text-base text-gray-600">Manage events and registrations for Sportograf North America</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center text-sm md:text-base"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6 md:mb-8">
          <nav className="-mb-px flex space-x-4 md:space-x-8 overflow-x-auto">
            {[
              { id: 'events', label: 'Events', icon: Calendar },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`py-2 px-3 md:px-1 border-b-2 font-medium text-xs md:text-sm flex items-center whitespace-nowrap ${
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
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-6 gap-4">
              <h2 className="text-lg md:text-2xl font-bold text-gray-900">Event Management</h2>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full md:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search events..."
                    className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 text-sm md:text-base"
                  />
                </div>
                <Link
                  href="/admin/events/create"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm md:text-base"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Create Event</span>
                  <span className="sm:hidden">Create</span>
                </Link>
              </div>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 md:p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                <p className="text-sm md:text-base text-gray-600">Get started by creating your first event</p>
              </div>
            ) : (
              <div>
                {/* Desktop Table View */}
                <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Travel Forms</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredEvents.map((event) => (
                        <tr key={event.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{event.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {event.endDate 
                                ? `${format(new Date(event.startDate), 'MMM d')} - ${format(new Date(event.endDate), 'MMM d, yyyy')}`
                                : format(new Date(event.startDate), 'MMM d, yyyy')
                              }
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{event.location || 'TBD'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              event.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {event.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {event._count?.eventRegistrations || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {event._count?.travelForms || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => {
                                window.open(`/admin/travel-forms?eventId=${event.id}`, '_blank')
                              }}
                              className="text-green-600 hover:text-green-900"
                              title="Travel Forms"
                            >
                              <Plane className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => fetchEventRegistrations(event.id)}
                              className="text-purple-600 hover:text-purple-900"
                              title="Requests"
                            >
                              <Users className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(event.id)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteEvent(event.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {filteredEvents.map((event) => (
                    <div key={event.id} className="bg-white rounded-lg shadow p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-gray-900 truncate">{event.title}</h3>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            {event.endDate 
                              ? `${format(new Date(event.startDate), 'MMM d')} - ${format(new Date(event.endDate), 'MMM d, yyyy')}`
                              : format(new Date(event.startDate), 'MMM d, yyyy')
                            }
                          </div>
                        </div>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ml-2 ${
                          event.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {event.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="flex items-center text-xs text-gray-500 mb-3">
                        <MapPin className="h-3 w-3 mr-1" />
                        {event.location || 'TBD'}
                      </div>

                      <div className="flex items-center space-x-3 mb-4">
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Plane className="h-3 w-3 mr-1" />
                              {event._count?.travelForms || 0}
                            </div>
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <Users className="h-3 w-3 mr-1" />
                              {event._count?.eventRegistrations || 0}
                            </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {
                              window.open(`/admin/travel-forms?eventId=${event.id}`, '_blank')
                            }}
                            className="flex items-center px-2 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded hover:bg-green-100 transition-colors"
                          >
                            <Plane className="h-3.5 w-3.5 mr-1" />
                            Travel
                          </button>
                          <button
                            onClick={() => fetchEventRegistrations(event.id)}
                            className="flex items-center px-2 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 rounded hover:bg-purple-100 transition-colors"
                          >
                            <Users className="h-3.5 w-3.5 mr-1" />
                            Requests
                          </button>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => openEditModal(event.id)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteEvent(event.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Registration Modal */}
        {selectedEventId && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center p-2 md:p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] md:max-h-[80vh] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 truncate pr-4">
                  Event Requests - {events.find(e => e.id === selectedEventId)?.title}
                </h3>
                <button
                  onClick={() => setSelectedEventId(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl md:text-3xl p-2 flex-shrink-0"
                >
                  ×
                </button>
              </div>
              
              <div className="overflow-y-auto p-4 md:p-6 flex-1">
                <div className="space-y-3">
                  {registrations.map((registration) => (
                    <div
                      key={registration._id}
                      className={`p-3 md:p-4 rounded-lg border transition-all ${
                        selectedRegistrations.has(registration._id)
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <button
                              onClick={() => toggleRegistrationSelection(registration._id)}
                              className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                selectedRegistrations.has(registration._id)
                                  ? 'bg-blue-600 border-blue-600 text-white'
                                  : 'border-gray-300 hover:border-blue-400'
                              }`}
                            >
                              {selectedRegistrations.has(registration._id) && (
                                <Check className="h-3 w-3" />
                              )}
                            </button>
                            <h4 className="text-sm md:text-base font-semibold text-gray-900 truncate">
                              {registration.name}
                            </h4>
                            {registration.hasTravelForm && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 flex-shrink-0">
                                <Plane className="h-3 w-3 mr-1" />
                                Travel
                              </span>
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center text-xs md:text-sm text-gray-600">
                              <span className="font-medium mr-2">Acronym:</span>
                              <span className="truncate">{registration.acronym}</span>
                            </div>
                            <div className="flex items-center text-xs md:text-sm text-gray-600">
                              <span className="font-medium mr-2">Email:</span>
                              <span className="truncate">{registration.email}</span>
                            </div>
                            <div className="flex items-center text-xs md:text-sm text-gray-600">
                              <span className="font-medium mr-2">Phone:</span>
                              <span>{registration.phoneNumber}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-gray-200 p-3 md:p-4 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <span className="text-sm text-gray-600 text-center sm:text-left">
                    {selectedRegistrations.size} of {registrations.length} selected
                  </span>
                  <button
                    onClick={() => setSelectedEventId(null)}
                    className="px-4 py-2 md:px-6 md:py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm md:text-base w-full sm:w-auto"
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
          <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center p-2 md:p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] md:max-h-[80vh] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 truncate pr-4">
                  Edit Event - {events.find(e => e.id === editingEventId)?.title}
                </h3>
                <button
                  onClick={closeEditModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl md:text-3xl p-2 flex-shrink-0"
                >
                  ×
                </button>
              </div>
              
              <div className="overflow-y-auto p-4 md:p-6 flex-1">
                <form className="space-y-4 md:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => handleEditFormChange('title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm md:text-base"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm md:text-base"
                      placeholder="Event location"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        value={editForm.startDate}
                        onChange={(e) => handleEditFormChange('startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm md:text-base"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm md:text-base"
                      />
                    </div>
                  </div>
                </form>
              </div>
              
              <div className="border-t border-gray-200 p-3 md:p-4 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-4 gap-3">
                  <button
                    onClick={closeEditModal}
                    className="px-4 py-2 md:px-6 md:py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm md:text-base w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updateEvent}
                    disabled={isUpdating}
                    className="px-4 py-2 md:px-6 md:py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base w-full sm:w-auto"
                  >
                    {isUpdating ? 'Updating...' : 'Update Event'}
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
