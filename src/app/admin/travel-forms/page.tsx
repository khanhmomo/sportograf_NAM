'use client'

import { useState, useEffect, Suspense } from 'react'
import { Plane, Car, Train, Calendar, MapPin, User, Mail, Phone, Eye, Trash2, Pencil, Download } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import * as XLSX from 'xlsx'
import { isAdmin } from '@/lib/auth'

interface TravelForm {
  id: string
  name: string
  acronym: string
  email: string
  phoneNumber: string
  gender?: string
  eventId: string
  eventTitle: string
  travelMethod: string
  selectedItinerary?: string
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
  // Ticket cost for flight/bus/train
  ticketCost?: string
  // Accommodation - hotel nights
  accommodationNeeded?: string
  hotelNights?: string[]
  otherHotelNight?: string
  specialRequests?: string
  // Admin only - car rental reservation
  carRentalReservation?: string
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
  suggestedFlights?: SuggestedFlight[]
}

interface SuggestedFlight {
  from: string
  to: string
  price: string
  budgetAllow: string
  link: string
  screenshot?: string
}

function TravelFormsPageContent() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId')
  
  const [travelForms, setTravelForms] = useState<TravelForm[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [selectedForm, setSelectedForm] = useState<TravelForm | null>(null)
  const [editingForm, setEditingForm] = useState<TravelForm | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    // Load role from localStorage
    setUserRole(localStorage.getItem('admin_role') || 'admin')
    
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

  const handleEdit = (form: TravelForm) => {
    setEditingForm(form)
    setIsEditing(true)
    setSelectedForm(null)
  }

  const closeEditModal = () => {
    setEditingForm(null)
    setIsEditing(false)
  }

  const updateTravelForm = async (formData: any) => {
    if (!editingForm) return

    try {
      const response = await fetch(`/api/admin/travel-forms/${editingForm.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchTravelForms()
        closeEditModal()
        setLastUpdated(new Date())
      } else {
        console.error('Failed to update travel form')
      }
    } catch (error) {
      console.error('Failed to update travel form:', error)
    }
  }

  const exportToExcel = () => {
    const data = travelForms.map((form) => {
      const getArrivalAirportStation = () => {
        if (form.travelMethod === 'flight') {
          return form.arrivalFromEventDepartureAirport || ''
        } else if (form.travelMethod === 'bus') {
          return form.arrivalStation || ''
        }
        return ''
      }
      
      const getDepartureAirportStation = () => {
        if (form.travelMethod === 'flight') {
          return form.departureFromEventArrivalAirport || ''
        } else if (form.travelMethod === 'bus') {
          return form.departureStation || ''
        }
        return ''
      }
      
      const getFlightTrainNumber = () => {
        if (form.travelMethod === 'flight') {
          return form.arrivalFromEventFlightNumber || ''
        } else if (form.travelMethod === 'bus') {
          return ''
        }
        return ''
      }
      
      const getDepartureFlightTrainNumber = () => {
        if (form.travelMethod === 'flight') {
          return form.departureFromEventFlightNumber || ''
        } else if (form.travelMethod === 'bus') {
          return ''
        }
        return ''
      }
      
      const getArrivalDate = () => {
        if (form.travelMethod === 'flight') {
          return form.arrivalFromEventArrivalDate || ''
        } else if (form.travelMethod === 'bus') {
          return form.busArrivalDate || ''
        }
        return ''
      }
      
      const getDepartureDate = () => {
        if (form.travelMethod === 'flight') {
          return form.departureFromEventDepartureDate || ''
        } else if (form.travelMethod === 'bus') {
          return form.busDepartureDate || ''
        }
        return ''
      }
      
      const getHotelInfo = () => {
        if (form.hotelNights && form.hotelNights.length > 0) {
          const abbreviations = form.hotelNights.map(night => {
            const parts = night.split(' ')
            if (parts.length >= 2) {
              const [day, month] = parts
              return `${month.substring(0, 3).toUpperCase()} ${day.substring(0, 3).toUpperCase()}`
            }
            return night
          })
          return abbreviations.join(', ') || ''
        }
        return ''
      }

      return {
        Name: form.name,
        Acronym: form.acronym,
        Transport: form.travelMethod,
        Phone: form.phoneNumber,
        Email: form.email,
        Miles: form.travelMethod === 'car' ? (form.expectedMiles || '') : '',
        Hotel: getHotelInfo(),
        Gender: form.gender || '',
        'Arrival Airport/Station': getArrivalAirportStation(),
        'Flight/Train #': getFlightTrainNumber(),
        'Arrival Date': getArrivalDate(),
        'Departure Date': getDepartureDate(),
        'Departure Flight/Train #': getDepartureFlightTrainNumber(),
        'Departure Airport/Station': getDepartureAirportStation(),
        'Car Rental': form.carRentalReservation || '',
        'Ticket Cost': form.ticketCost || '',
        Note: form.specialRequests || ''
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Travel Forms')
    
    const fileName = `travel-forms-${selectedEvent?.title || 'all'}-${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(workbook, fileName)
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

        {/* Export Button - Always visible */}
        <div className="mb-4 md:mb-6">
          <button
            onClick={exportToExcel}
            disabled={travelForms.length === 0}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm md:text-base"
          >
            <Download className="h-4 w-4 mr-2" />
            Export to Excel
          </button>
        </div>

        {/* Travel Forms Table */}
        {travelForms.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 md:p-8 text-center">
            <Plane className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">No travel forms found</h3>
            <p className="text-sm md:text-base text-gray-600">
              {selectedEvent ? `No travel forms submitted for ${selectedEvent.title}` : 'No travel form submissions yet'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-xs border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 text-left text-[10px] font-bold text-gray-900 uppercase tracking-wider border-r border-gray-300">Name</th>
                    <th className="px-2 py-2 text-left text-[10px] font-bold text-gray-900 uppercase tracking-wider border-r border-gray-300">Acronym</th>
                    <th className="px-2 py-2 text-left text-[10px] font-bold text-gray-900 uppercase tracking-wider border-r border-gray-300">Transport</th>
                    <th className="px-2 py-2 text-left text-[10px] font-bold text-gray-900 uppercase tracking-wider border-r border-gray-300">Phone</th>
                    <th className="px-2 py-2 text-left text-[10px] font-bold text-gray-900 uppercase tracking-wider border-r border-gray-300">Email</th>
                    <th className="px-2 py-2 text-left text-[10px] font-bold text-gray-900 uppercase tracking-wider border-r border-gray-300">Miles</th>
                    <th className="px-2 py-2 text-left text-[10px] font-bold text-gray-900 uppercase tracking-wider border-r border-gray-300">Hotel</th>
                    <th className="px-2 py-2 text-left text-[10px] font-bold text-gray-900 uppercase tracking-wider border-r border-gray-300">Gender</th>
                    <th className="px-2 py-2 text-left text-[10px] font-bold text-gray-900 uppercase tracking-wider border-r border-gray-300">Arrival Airport/Station</th>
                    <th className="px-2 py-2 text-left text-[10px] font-bold text-gray-900 uppercase tracking-wider border-r border-gray-300">Flight/Train #</th>
                    <th className="px-2 py-2 text-left text-[10px] font-bold text-gray-900 uppercase tracking-wider border-r border-gray-300">Arrival Date</th>
                    <th className="px-2 py-2 text-left text-[10px] font-bold text-gray-900 uppercase tracking-wider border-r border-gray-300">Departure Date</th>
                    <th className="px-2 py-2 text-left text-[10px] font-bold text-gray-900 uppercase tracking-wider border-r border-gray-300">Flight/Train #</th>
                    <th className="px-2 py-2 text-left text-[10px] font-bold text-gray-900 uppercase tracking-wider border-r border-gray-300">Departure Airport/Station</th>
                    <th className="px-2 py-2 text-left text-[10px] font-bold text-gray-900 uppercase tracking-wider border-r border-gray-300">Car Rental</th>
                    <th className="px-2 py-2 text-left text-[10px] font-bold text-gray-900 uppercase tracking-wider border-r border-gray-300">Ticket Cost</th>
                    <th className="px-2 py-2 text-left text-[10px] font-bold text-gray-900 uppercase tracking-wider border-r border-gray-300">Note</th>
                    <th className="px-2 py-2 text-left text-[10px] font-bold text-gray-900 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {travelForms.map((form) => {
                    const getArrivalAirportStation = () => {
                      if (form.travelMethod === 'flight') {
                        return form.arrivalFromEventArrivalAirport || ''
                      } else if (form.travelMethod === 'bus') {
                        return form.arrivalStation || ''
                      }
                      return ''
                    }
                    
                    const getDepartureAirportStation = () => {
                      if (form.travelMethod === 'flight') {
                        return form.departureFromEventDepartureAirport || ''
                      } else if (form.travelMethod === 'bus') {
                        return form.departureStation || ''
                      }
                      return ''
                    }
                    
                    const getFlightTrainNumber = () => {
                      if (form.travelMethod === 'flight') {
                        return form.arrivalFromEventFlightNumber || ''
                      } else if (form.travelMethod === 'bus') {
                        return ''
                      }
                      return ''
                    }
                    
                    const getDepartureFlightTrainNumber = () => {
                      if (form.travelMethod === 'flight') {
                        return form.departureFromEventFlightNumber || ''
                      } else if (form.travelMethod === 'bus') {
                        return ''
                      }
                      return ''
                    }
                    
                    const getArrivalDate = () => {
                      if (form.travelMethod === 'flight') {
                        return form.arrivalFromEventArrivalDate || ''
                      } else if (form.travelMethod === 'bus') {
                        return form.busArrivalDate || ''
                      }
                      return ''
                    }
                    
                    const getDepartureDate = () => {
                      if (form.travelMethod === 'flight') {
                        return form.departureFromEventDepartureDate || ''
                      } else if (form.travelMethod === 'bus') {
                        return form.busDepartureDate || ''
                      }
                      return ''
                    }

                    const formatDate = (dateStr?: string) => {
                      if (!dateStr) return ''
                      try {
                        const date = new Date(dateStr)
                        const month = String(date.getMonth() + 1).padStart(2, '0')
                        const day = String(date.getDate()).padStart(2, '0')
                        const year = date.getFullYear()
                        return `${month}/${day}/${year}`
                      } catch {
                        return ''
                      }
                    }

                    const getHotelInfo = () => {
                      if (form.accommodationNeeded === 'yes' && form.hotelNights && form.hotelNights.length > 0) {
                        const nightAbbreviations: Record<string, string> = {
                          wednesday: 'W',
                          thursday: 'Th',
                          friday: 'F',
                          saturday: 'Sa',
                          sunday: 'Su'
                        }
                        
                        const abbreviations = form.hotelNights
                          .filter(night => night !== 'other')
                          .map(night => nightAbbreviations[night] || night)
                        
                        if (form.hotelNights.includes('other') && form.otherHotelNight) {
                          return `${abbreviations.join(', ')}, ${form.otherHotelNight}`
                        }
                        
                        return abbreviations.join(', ') || ''
                      }
                      return ''
                    }

                    // Check if ticket cost is over budget
                    const isOverBudget = () => {
                      if (!form.selectedItinerary || !form.ticketCost || form.travelMethod !== 'flight') {
                        return false
                      }
                      
                      const event = events.find(e => e.id === form.eventId)
                      if (!event || !event.suggestedFlights) {
                        return false
                      }
                      
                      const itineraryIndex = parseInt(form.selectedItinerary)
                      const flight = event.suggestedFlights[itineraryIndex]
                      if (!flight) {
                        return false
                      }
                      
                      const budget = parseFloat(flight.budgetAllow)
                      const cost = parseFloat(form.ticketCost)
                      
                      return cost > budget
                    }
                    
                    const rowClass = isOverBudget() 
                      ? 'bg-red-100 hover:bg-red-200' 
                      : 'hover:bg-gray-50'
                    
                    return (
                      <tr key={form.id} className={rowClass}>
                        <td className="px-2 py-2 whitespace-nowrap text-[10px] font-medium text-gray-900 border-r border-gray-300">{form.name}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-[10px] text-gray-900 border-r border-gray-300">{form.acronym}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-[10px] text-gray-900 capitalize border-r border-gray-300">{form.travelMethod}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-[10px] text-gray-900 border-r border-gray-300">{form.phoneNumber}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-[10px] text-gray-900 border-r border-gray-300">{form.email}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-[10px] text-gray-900 border-r border-gray-300">{form.travelMethod === 'car' ? (form.expectedMiles || '') : ''}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-[10px] text-gray-900 border-r border-gray-300">{getHotelInfo()}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-[10px] text-gray-900 capitalize border-r border-gray-300">{form.gender || ''}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-[10px] text-gray-900 border-r border-gray-300">{getArrivalAirportStation()}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-[10px] text-gray-900 border-r border-gray-300">{getFlightTrainNumber()}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-[10px] text-gray-900 border-r border-gray-300">{formatDate(getDepartureDate())}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-[10px] text-gray-900 border-r border-gray-300">{formatDate(getArrivalDate())}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-[10px] text-gray-900 border-r border-gray-300">{getDepartureFlightTrainNumber()}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-[10px] text-gray-900 border-r border-gray-300">{getDepartureAirportStation()}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-[10px] text-gray-900 border-r border-gray-300">{form.carRentalReservation || ''}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-[10px] text-gray-900 border-r border-gray-300">{form.ticketCost || ''}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-[10px] text-gray-900 border-r border-gray-300">{form.specialRequests || ''}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-[10px] text-gray-900">
                          {userRole === 'admin' && (
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleEdit(form)}
                                className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                                title="Edit"
                              >
                                <Pencil className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => deleteTravelForm(form.id)}
                                className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                                title="Delete"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {travelForms.map((form) => {
                const getArrivalAirportStation = () => {
                  if (form.travelMethod === 'flight') {
                    return form.arrivalFromEventArrivalAirport || ''
                  } else if (form.travelMethod === 'bus') {
                    return form.arrivalStation || ''
                  }
                  return ''
                }
                
                const getDepartureAirportStation = () => {
                  if (form.travelMethod === 'flight') {
                    return form.departureFromEventDepartureAirport || ''
                  } else if (form.travelMethod === 'bus') {
                    return form.departureStation || ''
                  }
                  return ''
                }
                
                const getFlightTrainNumber = () => {
                  if (form.travelMethod === 'flight') {
                    return form.arrivalFromEventFlightNumber || ''
                  } else if (form.travelMethod === 'bus') {
                    return ''
                  }
                  return ''
                }
                
                const getDepartureFlightTrainNumber = () => {
                  if (form.travelMethod === 'flight') {
                    return form.departureFromEventFlightNumber || ''
                  } else if (form.travelMethod === 'bus') {
                    return ''
                  }
                  return ''
                }
                
                const getArrivalDate = () => {
                  if (form.travelMethod === 'flight') {
                    return form.arrivalFromEventArrivalDate || ''
                  } else if (form.travelMethod === 'bus') {
                    return form.busArrivalDate || ''
                  }
                  return ''
                }
                
                const getDepartureDate = () => {
                  if (form.travelMethod === 'flight') {
                    return form.departureFromEventDepartureDate || ''
                  } else if (form.travelMethod === 'bus') {
                    return form.busDepartureDate || ''
                  }
                  return ''
                }

                const formatDate = (dateStr?: string) => {
                  if (!dateStr) return ''
                  try {
                    const date = new Date(dateStr)
                    const month = String(date.getMonth() + 1).padStart(2, '0')
                    const day = String(date.getDate()).padStart(2, '0')
                    const year = date.getFullYear()
                    return `${month}/${day}/${year}`
                  } catch {
                    return ''
                  }
                }

                const getHotelInfo = () => {
                  if (form.accommodationNeeded === 'yes' && form.hotelNights && form.hotelNights.length > 0) {
                    const nightAbbreviations: Record<string, string> = {
                      wednesday: 'W',
                      thursday: 'Th',
                      friday: 'F',
                      saturday: 'Sa',
                      sunday: 'Su'
                    }
                    
                    const abbreviations = form.hotelNights
                      .filter(night => night !== 'other')
                      .map(night => nightAbbreviations[night] || night)
                    
                    if (form.hotelNights.includes('other') && form.otherHotelNight) {
                      return `${abbreviations.join(', ')}, ${form.otherHotelNight}`
                    }
                    
                    return abbreviations.join(', ') || ''
                  }
                  return ''
                }

                // Check if ticket cost is over budget
                const isOverBudget = () => {
                  if (!form.selectedItinerary || !form.ticketCost || form.travelMethod !== 'flight') {
                    return false
                  }
                  
                  const event = events.find(e => e.id === form.eventId)
                  if (!event || !event.suggestedFlights) {
                    return false
                  }
                  
                  const itineraryIndex = parseInt(form.selectedItinerary)
                  const flight = event.suggestedFlights[itineraryIndex]
                  if (!flight) {
                    return false
                  }
                  
                  const budget = parseFloat(flight.budgetAllow)
                  const cost = parseFloat(form.ticketCost)
                  
                  return cost > budget
                }

                const cardClass = isOverBudget()
                  ? 'bg-red-100 rounded-lg shadow p-4'
                  : 'bg-white rounded-lg shadow p-4'
                
                return (
                  <div key={form.id} className={cardClass}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 truncate">{form.acronym} - {form.name}</h3>
                        <div className="text-xs text-gray-900 mt-1">{form.email}</div>
                      </div>
                      {userRole === 'admin' && (
                        <div className="flex space-x-2 ml-2">
                          <button
                            onClick={() => handleEdit(form)}
                            className="text-blue-600 p-1 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteTravelForm(form.id)}
                            className="text-red-600 p-1 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div><span className="text-gray-900">Transport:</span> <span className="text-gray-900">{form.travelMethod}</span></div>
                        <div><span className="text-gray-900">Phone:</span> <span className="text-gray-900">{form.phoneNumber}</span></div>
                        <div><span className="text-gray-900">Email:</span> <span className="text-gray-900">{form.email}</span></div>
                        <div><span className="text-gray-900">Miles:</span> <span className="text-gray-900">{form.travelMethod === 'car' ? (form.expectedMiles || '') : ''}</span></div>
                        <div><span className="text-gray-900">Hotel:</span> <span className="text-gray-900">{getHotelInfo()}</span></div>
                        <div><span className="text-gray-900">Gender:</span> <span className="text-gray-900">{form.gender || ''}</span></div>
                      </div>
                      <div><span className="text-gray-900">Arrival Flight/Train #:</span> <span className="text-gray-900">{getFlightTrainNumber()}</span></div>
                      <div><span className="text-gray-900">Arrival Airport/Station:</span> <span className="text-gray-900">{getArrivalAirportStation()}</span></div>
                      <div><span className="text-gray-900">Arrival Date:</span> <span className="text-gray-900">{formatDate(getArrivalDate())}</span></div>
                      <div><span className="text-gray-900">Departure Date:</span> <span className="text-gray-900">{formatDate(getDepartureDate())}</span></div>
                      <div><span className="text-gray-900">Departure Flight/Train #:</span> <span className="text-gray-900">{getDepartureFlightTrainNumber()}</span></div>
                      <div><span className="text-gray-900">Departure Airport/Station:</span> <span className="text-gray-900">{getDepartureAirportStation()}</span></div>
                      <div><span className="text-gray-900">Car Rental Reservation:</span> <span className="text-gray-900">{form.carRentalReservation || ''}</span></div>
                      <div><span className="text-gray-900">Ticket Cost:</span> <span className="text-gray-900">{form.ticketCost || ''}</span></div>
                      <div><span className="text-gray-900">Note:</span> <span className="text-gray-900">{form.specialRequests || ''}</span></div>
                    </div>
                  </div>
                )
              })}
            </div>
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
                                <div><strong className="text-gray-900">Flight Number:</strong> <span className="text-gray-900">{selectedForm.arrivalFromEventFlightNumber || ''}</span></div>
                                <div><strong className="text-gray-900">Departure Airport:</strong> <span className="text-gray-900">{selectedForm.arrivalFromEventDepartureAirport || ''}</span></div>
                                <div><strong className="text-gray-900">Arrival Airport:</strong> <span className="text-gray-900">{selectedForm.arrivalFromEventArrivalAirport || ''}</span></div>
                                <div><strong className="text-gray-900">Departure Date:</strong> <span className="text-gray-900">{selectedForm.arrivalFromEventDepartureDate || ''}</span></div>
                                <div><strong className="text-gray-900">Departure Time:</strong> <span className="text-gray-900">{selectedForm.arrivalFromEventDepartureTime || ''}</span></div>
                                <div><strong className="text-gray-900">Arrival Date:</strong> <span className="text-gray-900">{selectedForm.arrivalFromEventArrivalDate || ''}</span></div>
                                <div><strong className="text-gray-900">Arrival Time:</strong> <span className="text-gray-900">{selectedForm.arrivalFromEventArrivalTime || ''}</span></div>
                              </div>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-700 mb-2">Departure After Event</h5>
                              <div className="space-y-1 text-sm">
                                <div><strong className="text-gray-900">Flight Number:</strong> <span className="text-gray-900">{selectedForm.departureFromEventFlightNumber || ''}</span></div>
                                <div><strong className="text-gray-900">Departure Airport:</strong> <span className="text-gray-900">{selectedForm.departureFromEventDepartureAirport || ''}</span></div>
                                <div><strong className="text-gray-900">Arrival Airport:</strong> <span className="text-gray-900">{selectedForm.departureFromEventArrivalAirport || ''}</span></div>
                                <div><strong className="text-gray-900">Departure Date:</strong> <span className="text-gray-900">{selectedForm.departureFromEventDepartureDate || ''}</span></div>
                                <div><strong className="text-gray-900">Departure Time:</strong> <span className="text-gray-900">{selectedForm.departureFromEventDepartureTime || ''}</span></div>
                                <div><strong className="text-gray-900">Arrival Date:</strong> <span className="text-gray-900">{selectedForm.departureFromEventArrivalDate || ''}</span></div>
                                <div><strong className="text-gray-900">Arrival Time:</strong> <span className="text-gray-900">{selectedForm.departureFromEventArrivalTime || ''}</span></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedForm.travelMethod === 'car' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="space-y-1 text-sm">
                              <div><strong className="text-gray-900">Driving From:</strong> <span className="text-gray-900">{selectedForm.drivingFrom || ''}</span></div>
                              <div><strong className="text-gray-900">Expected Miles:</strong> <span className="text-gray-900">{selectedForm.expectedMiles || ''}</span></div>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedForm.travelMethod === 'bus' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-gray-700 mb-2">Arrival</h5>
                            <div className="space-y-1 text-sm">
                              <div><strong className="text-gray-900">Station:</strong> <span className="text-gray-900">{selectedForm.arrivalStation || ''}</span></div>
                              <div><strong className="text-gray-900">Date:</strong> <span className="text-gray-900">{selectedForm.busArrivalDate || ''}</span></div>
                              <div><strong className="text-gray-900">Time:</strong> <span className="text-gray-900">{selectedForm.busArrivalTime || ''}</span></div>
                            </div>
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-700 mb-2">Departure</h5>
                            <div className="space-y-1 text-sm">
                              <div><strong className="text-gray-900">Station:</strong> <span className="text-gray-900">{selectedForm.departureStation || ''}</span></div>
                              <div><strong className="text-gray-900">Date:</strong> <span className="text-gray-900">{selectedForm.busDepartureDate || ''}</span></div>
                              <div><strong className="text-gray-900">Time:</strong> <span className="text-gray-900">{selectedForm.busDepartureTime || ''}</span></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Accommodation */}
                    {selectedForm.accommodationNeeded === 'yes' && (
                      <div className="space-y-4">
                        <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Accommodation</h4>
                        <div className="text-sm">
                          {selectedForm.hotelNights && selectedForm.hotelNights.length > 0 ? (
                            <div>
                              <div><strong className="text-gray-900">Hotel Nights:</strong> <span className="text-gray-900">
                                {(() => {
                                  const nightAbbreviations: Record<string, string> = {
                                    wednesday: 'W',
                                    thursday: 'Th',
                                    friday: 'F',
                                    saturday: 'Sa',
                                    sunday: 'Su'
                                  }
                                  
                                  const abbreviations = selectedForm.hotelNights
                                    .filter(night => night !== 'other')
                                    .map(night => nightAbbreviations[night] || night)
                                  
                                  if (selectedForm.hotelNights.includes('other') && selectedForm.otherHotelNight) {
                                    return `${abbreviations.join(', ')}, ${selectedForm.otherHotelNight}`
                                  }
                                  
                                  return abbreviations.join(', ') || ''
                                })()}
                              </span></div>
                            </div>
                          ) : (
                            <div><strong className="text-gray-900">Hotel Nights:</strong> <span className="text-gray-900"></span></div>
                          )}
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
                          <span className="text-gray-900">{new Date(selectedForm.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })} {new Date(selectedForm.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditing && editingForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeEditModal}></div>
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
              <div className="relative bg-white rounded-lg shadow-xl transform transition-all w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                <div className="px-4 pt-5 pb-4 sm:p-6">
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Travel Form</h1>
                    <p className="text-gray-600">Editing travel details for {editingForm.name}</p>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Left Column - Basic Info */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <form onSubmit={(e) => { e.preventDefault(); updateTravelForm(editingForm); }} className="space-y-6">
                        {/* Personal Information */}
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Name *
                              </label>
                              <input
                                type="text"
                                value={editingForm.name}
                                onChange={(e) => setEditingForm({...editingForm, name: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                                placeholder="Enter your full name"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Acronym *
                              </label>
                              <input
                                type="text"
                                value={editingForm.acronym}
                                onChange={(e) => setEditingForm({...editingForm, acronym: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                                placeholder="e.g., J.D."
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email *
                              </label>
                              <input
                                type="email"
                                value={editingForm.email}
                                onChange={(e) => setEditingForm({...editingForm, email: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                                placeholder="your@email.com"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Gender *
                              </label>
                              <select
                                value={editingForm.gender || ''}
                                onChange={(e) => setEditingForm({...editingForm, gender: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                              >
                                <option value="">Select gender...</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                                <option value="prefer-not-to-say">Prefer not to say</option>
                              </select>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Phone Number *
                            </label>
                            <input
                              type="tel"
                              value={editingForm.phoneNumber}
                              onChange={(e) => setEditingForm({...editingForm, phoneNumber: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                              placeholder="(555) 123-4567"
                            />
                          </div>
                        </div>

                        {/* Travel Method Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Plane className="h-4 w-4 inline mr-1" />
                            Travel Method *
                          </label>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <label className="flex items-center p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-colors flex-1">
                              <input
                                type="radio"
                                checked={editingForm.travelMethod === 'flight'}
                                onChange={(e) => setEditingForm({...editingForm, travelMethod: e.target.value})}
                                value="flight"
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 mr-2"
                              />
                              <Plane className="h-4 w-4 mr-2 text-gray-600" />
                              <span className="text-gray-700 font-medium">Flight</span>
                            </label>

                            <label className="flex items-center p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-colors flex-1">
                              <input
                                type="radio"
                                checked={editingForm.travelMethod === 'car'}
                                onChange={(e) => setEditingForm({...editingForm, travelMethod: e.target.value})}
                                value="car"
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 mr-2"
                              />
                              <Car className="h-4 w-4 mr-2 text-gray-600" />
                              <span className="text-gray-700 font-medium">Car/Carpool</span>
                            </label>

                            <label className="flex items-center p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-colors flex-1">
                              <input
                                type="radio"
                                checked={editingForm.travelMethod === 'bus'}
                                onChange={(e) => setEditingForm({...editingForm, travelMethod: e.target.value})}
                                value="bus"
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 mr-2"
                              />
                              <Train className="h-4 w-4 mr-2 text-gray-600" />
                              <span className="text-gray-700 font-medium">Bus/Train</span>
                            </label>
                          </div>
                        </div>

                        {/* Admin Only - Car Rental Reservation */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-yellow-800 mb-2">Admin Only - Car Rental Reservation</h4>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Car Rental Reservation Number (National/Enterprise)</label>
                              <input
                                type="text"
                                value={editingForm.carRentalReservation || ''}
                                onChange={(e) => setEditingForm({...editingForm, carRentalReservation: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                                placeholder="Enter reservation number"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Special Requests */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Special Requests or Comments
                          </label>
                          <textarea
                            value={editingForm.specialRequests || ''}
                            onChange={(e) => setEditingForm({...editingForm, specialRequests: e.target.value})}
                            rows={3}
                            className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                            placeholder="Any special requests or additional information..."
                          />
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                          <button
                            type="button"
                            onClick={closeEditModal}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Save Changes
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Right Column - Travel Details */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        {editingForm.travelMethod === 'flight' && <Plane className="h-5 w-5 mr-2 text-blue-600" />}
                        {editingForm.travelMethod === 'car' && <Car className="h-5 w-5 mr-2 text-blue-600" />}
                        {editingForm.travelMethod === 'bus' && <Train className="h-5 w-5 mr-2 text-blue-600" />}
                        {editingForm.travelMethod === 'flight' && 'Flight Details'}
                        {editingForm.travelMethod === 'car' && 'Driving Details'}
                        {editingForm.travelMethod === 'bus' && 'Bus/Train Details'}
                      </h3>

                      {/* Flight Details */}
                      {editingForm.travelMethod === 'flight' && (
                        <div className="space-y-4">
                          {/* Flight Tabs */}
                          <div className="border-b border-gray-200">
                            <nav className="flex -mb-px">
                              <button
                                className="py-2 px-4 text-sm font-medium border-b-2 border-blue-500 text-blue-600"
                              >
                                <Plane className="h-4 w-4 inline mr-1" />
                                Arrive before event
                              </button>
                              <button
                                className="py-2 px-4 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700"
                              >
                                <Plane className="h-4 w-4 inline mr-1" />
                                Depart after event
                              </button>
                            </nav>
                          </div>

                          {/* Arrival Flight Details */}
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Flight Number</label>
                              <input
                                type="text"
                                value={editingForm.arrivalFromEventFlightNumber || ''}
                                onChange={(e) => setEditingForm({...editingForm, arrivalFromEventFlightNumber: e.target.value})}
                                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
                                placeholder="e.g., AA5678"
                              />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Departure Airport</label>
                                <input
                                  type="text"
                                  value={editingForm.arrivalFromEventDepartureAirport || ''}
                                  onChange={(e) => setEditingForm({...editingForm, arrivalFromEventDepartureAirport: e.target.value})}
                                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
                                  placeholder="e.g., JFK"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Airport</label>
                                <input
                                  type="text"
                                  value={editingForm.arrivalFromEventArrivalAirport || ''}
                                  onChange={(e) => setEditingForm({...editingForm, arrivalFromEventArrivalAirport: e.target.value})}
                                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
                                  placeholder="e.g., LAX"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Departure Date</label>
                                <input
                                  type="date"
                                  value={editingForm.arrivalFromEventDepartureDate || ''}
                                  onChange={(e) => setEditingForm({...editingForm, arrivalFromEventDepartureDate: e.target.value})}
                                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Departure Time</label>
                                <input
                                  type="time"
                                  value={editingForm.arrivalFromEventDepartureTime || ''}
                                  onChange={(e) => setEditingForm({...editingForm, arrivalFromEventDepartureTime: e.target.value})}
                                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Date</label>
                                <input
                                  type="date"
                                  value={editingForm.arrivalFromEventArrivalDate || ''}
                                  onChange={(e) => setEditingForm({...editingForm, arrivalFromEventArrivalDate: e.target.value})}
                                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Time</label>
                                <input
                                  type="time"
                                  value={editingForm.arrivalFromEventArrivalTime || ''}
                                  onChange={(e) => setEditingForm({...editingForm, arrivalFromEventArrivalTime: e.target.value})}
                                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Ticket Cost for Flight/Bus */}
                      {(editingForm.travelMethod === 'flight' || editingForm.travelMethod === 'bus') && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Cost (€)</label>
                          <input
                            type="text"
                            value={editingForm.ticketCost || ''}
                            onChange={(e) => setEditingForm({...editingForm, ticketCost: e.target.value})}
                            className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
                            placeholder="Enter ticket cost"
                          />
                        </div>
                      )}

                      {/* Car Details */}
                      {editingForm.travelMethod === 'car' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Driving From</label>
                              <input
                                type="text"
                                value={editingForm.drivingFrom || ''}
                                onChange={(e) => setEditingForm({...editingForm, drivingFrom: e.target.value})}
                                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
                                placeholder="e.g., New York, NY"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Miles</label>
                              <input
                                type="text"
                                value={editingForm.expectedMiles || ''}
                                onChange={(e) => setEditingForm({...editingForm, expectedMiles: e.target.value})}
                                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
                                placeholder="e.g., 250"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Bus Details */}
                      {editingForm.travelMethod === 'bus' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Station</label>
                              <input
                                type="text"
                                value={editingForm.arrivalStation || ''}
                                onChange={(e) => setEditingForm({...editingForm, arrivalStation: e.target.value})}
                                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
                                placeholder="e.g., Penn Station"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Departure Station</label>
                              <input
                                type="text"
                                value={editingForm.departureStation || ''}
                                onChange={(e) => setEditingForm({...editingForm, departureStation: e.target.value})}
                                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
                                placeholder="e.g., Union Station"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Date</label>
                              <input
                                type="date"
                                value={editingForm.busArrivalDate || ''}
                                onChange={(e) => setEditingForm({...editingForm, busArrivalDate: e.target.value})}
                                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Time</label>
                              <input
                                type="time"
                                value={editingForm.busArrivalTime || ''}
                                onChange={(e) => setEditingForm({...editingForm, busArrivalTime: e.target.value})}
                                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Departure Date</label>
                              <input
                                type="date"
                                value={editingForm.busDepartureDate || ''}
                                onChange={(e) => setEditingForm({...editingForm, busDepartureDate: e.target.value})}
                                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Departure Time</label>
                              <input
                                type="time"
                                value={editingForm.busDepartureTime || ''}
                                onChange={(e) => setEditingForm({...editingForm, busDepartureTime: e.target.value})}
                                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Accommodation Section */}
                      <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-purple-500 mt-6">
                        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                          <svg className="h-4 w-4 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                          </svg>
                          Accommodation Request
                        </h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Do you need accommodation?
                            </label>
                            <div className="space-y-2">
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  checked={editingForm.accommodationNeeded === 'yes'}
                                  onChange={(e) => setEditingForm({...editingForm, accommodationNeeded: e.target.value})}
                                  value="yes"
                                  className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 mr-2"
                                />
                                <span className="text-gray-700">Yes, I need accommodation</span>
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  checked={editingForm.accommodationNeeded === 'no'}
                                  onChange={(e) => setEditingForm({...editingForm, accommodationNeeded: e.target.value})}
                                  value="no"
                                  className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 mr-2"
                                />
                                <span className="text-gray-700">No, I don't need accommodation</span>
                              </label>
                            </div>
                          </div>

                          {editingForm.accommodationNeeded === 'yes' && (
                            <div className="space-y-3 pl-6 border-l-2 border-purple-200">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Hotel Nights Needed</label>
                                <div className="space-y-2">
                                  <label className="flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={editingForm.hotelNights?.includes('wednesday')}
                                      onChange={(e) => {
                                        const nights = editingForm.hotelNights || []
                                        if (e.target.checked) {
                                          setEditingForm({...editingForm, hotelNights: [...nights, 'wednesday']})
                                        } else {
                                          setEditingForm({...editingForm, hotelNights: nights.filter(n => n !== 'wednesday')})
                                        }
                                      }}
                                      className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 mr-2"
                                    />
                                    <span className="text-gray-700">Wednesday night</span>
                                  </label>
                                  <label className="flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={editingForm.hotelNights?.includes('thursday')}
                                      onChange={(e) => {
                                        const nights = editingForm.hotelNights || []
                                        if (e.target.checked) {
                                          setEditingForm({...editingForm, hotelNights: [...nights, 'thursday']})
                                        } else {
                                          setEditingForm({...editingForm, hotelNights: nights.filter(n => n !== 'thursday')})
                                        }
                                      }}
                                      className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 mr-2"
                                    />
                                    <span className="text-gray-700">Thursday night</span>
                                  </label>
                                  <label className="flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={editingForm.hotelNights?.includes('friday')}
                                      onChange={(e) => {
                                        const nights = editingForm.hotelNights || []
                                        if (e.target.checked) {
                                          setEditingForm({...editingForm, hotelNights: [...nights, 'friday']})
                                        } else {
                                          setEditingForm({...editingForm, hotelNights: nights.filter(n => n !== 'friday')})
                                        }
                                      }}
                                      className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 mr-2"
                                    />
                                    <span className="text-gray-700">Friday night</span>
                                  </label>
                                  <label className="flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={editingForm.hotelNights?.includes('saturday')}
                                      onChange={(e) => {
                                        const nights = editingForm.hotelNights || []
                                        if (e.target.checked) {
                                          setEditingForm({...editingForm, hotelNights: [...nights, 'saturday']})
                                        } else {
                                          setEditingForm({...editingForm, hotelNights: nights.filter(n => n !== 'saturday')})
                                        }
                                      }}
                                      className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 mr-2"
                                    />
                                    <span className="text-gray-700">Saturday night</span>
                                  </label>
                                  <label className="flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={editingForm.hotelNights?.includes('sunday')}
                                      onChange={(e) => {
                                        const nights = editingForm.hotelNights || []
                                        if (e.target.checked) {
                                          setEditingForm({...editingForm, hotelNights: [...nights, 'sunday']})
                                        } else {
                                          setEditingForm({...editingForm, hotelNights: nights.filter(n => n !== 'sunday')})
                                        }
                                      }}
                                      className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 mr-2"
                                    />
                                    <span className="text-gray-700">Sunday night</span>
                                  </label>
                                  <label className="flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={editingForm.hotelNights?.includes('other')}
                                      onChange={(e) => {
                                        const nights = editingForm.hotelNights || []
                                        if (e.target.checked) {
                                          setEditingForm({...editingForm, hotelNights: [...nights, 'other']})
                                        } else {
                                          setEditingForm({...editingForm, hotelNights: nights.filter(n => n !== 'other')})
                                        }
                                      }}
                                      className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 mr-2"
                                    />
                                    <span className="text-gray-700">Other:</span>
                                  </label>
                                  {editingForm.hotelNights?.includes('other') && (
                                    <input
                                      type="text"
                                      value={editingForm.otherHotelNight || ''}
                                      onChange={(e) => setEditingForm({...editingForm, otherHotelNight: e.target.value})}
                                      placeholder="Please specify"
                                      className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500 mt-2"
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
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
