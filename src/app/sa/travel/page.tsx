'use client'

import React, { useState, useEffect, Fragment } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Calendar, Plane, X, CheckCircle, Car, Train } from 'lucide-react'
import { useToast } from '@/hooks/useToast'

const travelFormSchema = z.object({
  eventId: z.string().min(1, 'Please select an event'),
  name: z.string().min(1, 'Name is required'),
  acronym: z.string().min(1, 'Acronym is required'),
  email: z.string().email('Valid email is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']),
  travelMethod: z.enum(['flight', 'car', 'bus']),
  // Itinerary selection for flight
  selectedItinerary: z.string().optional(),
  // Arrival from event fields
  arrivalFromEventFlightNumber: z.string().optional(),
  arrivalFromEventDepartureAirport: z.string().optional(),
  arrivalFromEventArrivalAirport: z.string().optional(),
  arrivalFromEventDepartureDate: z.string().optional(),
  arrivalFromEventDepartureTime: z.string().optional(),
  arrivalFromEventArrivalDate: z.string().optional(),
  arrivalFromEventArrivalTime: z.string().optional(),
  // Departure from event fields
  departureFromEventFlightNumber: z.string().optional(),
  departureFromEventDepartureAirport: z.string().optional(),
  departureFromEventArrivalAirport: z.string().optional(),
  departureFromEventDepartureDate: z.string().optional(),
  departureFromEventDepartureTime: z.string().optional(),
  departureFromEventArrivalDate: z.string().optional(),
  departureFromEventArrivalTime: z.string().optional(),
  // Car/Carpool specific fields
  drivingFrom: z.string().optional(),
  expectedMiles: z.string().optional(),
  // Bus specific fields
  arrivalStation: z.string().optional(),
  departureStation: z.string().optional(),
  busArrivalDate: z.string().optional(),
  busArrivalTime: z.string().optional(),
  busDepartureDate: z.string().optional(),
  busDepartureTime: z.string().optional(),
  // Ticket cost for flight/bus/train
  ticketCost: z.string().optional(),
  // Accommodation request - hotel nights
  accommodationNeeded: z.enum(['yes', 'no']).optional(),
  hotelNights: z.array(z.string()).optional(),
  otherHotelNight: z.string().optional(),
  specialRequests: z.string().optional(),
}).refine((data) => {
  if (data.travelMethod === 'flight') {
    return !!(data.arrivalFromEventArrivalAirport &&
              data.arrivalFromEventFlightNumber &&
              data.arrivalFromEventArrivalDate &&
              data.arrivalFromEventArrivalTime &&
              data.departureFromEventDepartureAirport &&
              data.departureFromEventFlightNumber &&
              data.departureFromEventDepartureDate &&
              data.departureFromEventDepartureTime &&
              data.ticketCost)
  }
  return true
}, { message: 'All flight fields are required' })

type TravelFormData = z.infer<typeof travelFormSchema>

interface Event {
  id: string
  title: string
  location?: string
  startDate: string
  endDate?: string
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

export default function TravelPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [selectedTravelMethod, setSelectedTravelMethod] = useState<string>('')
  const [selectedEventSuggestedFlights, setSelectedEventSuggestedFlights] = useState<SuggestedFlight[]>([])
  const [expandedScreenshotIndex, setExpandedScreenshotIndex] = useState<number | null>(null)
  const [budgetWarning, setBudgetWarning] = useState<string>('')
  const { showToast } = useToast()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<TravelFormData>({
    resolver: zodResolver(travelFormSchema),
  })

  const travelMethod = watch('travelMethod')
  const eventId = watch('eventId')
  const selectedItinerary = watch('selectedItinerary')

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    if (eventId) {
      const selectedEvent = events.find(e => e.id === eventId)
      setSelectedEventSuggestedFlights(selectedEvent?.suggestedFlights || [])
    } else {
      setSelectedEventSuggestedFlights([])
    }
  }, [eventId, events])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/sa/api/events')
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      } else {
        console.error('Failed to fetch events:', response.status)
      }
    } catch (error) {
      console.error('Failed to fetch events:', error)
    }
  }

  const formatPhoneNumber = (value: string) => {
    // Remove non-digit characters and limit to 15 digits
    const phoneNumber = value.replace(/\D/g, '').slice(0, 15)
    return phoneNumber
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhoneNumber(e.target.value)
    e.target.value = formattedValue
    // Trigger the react-hook-form onChange
    e.target.dispatchEvent(new Event('input', { bubbles: true }))
  }

  const handleTicketCostChange = (value: string) => {
    const cost = parseFloat(value)
    if (selectedItinerary && selectedEventSuggestedFlights.length > 0) {
      const index = parseInt(selectedItinerary)
      const flight = selectedEventSuggestedFlights[index]
      const budget = parseFloat(flight.budgetAllow)
      if (cost > budget) {
        setBudgetWarning('Over budget')
      } else {
        setBudgetWarning('')
      }
    } else {
      setBudgetWarning('')
    }
  }

  const onSubmit = async (data: TravelFormData) => {
    setIsSubmitting(true)
    try {
      console.log('Submitting travel form:', data)
      
      const response = await fetch('/sa/api/travel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      console.log('Response status:', response.status)

      if (response.ok) {
        setIsSubmitted(true)
        reset()
        showToast({
          title: 'Travel Form Submitted!',
          message: 'Your travel information has been received and will be processed.',
          type: 'success'
        })
      } else {
        let errorMessage = 'Failed to submit travel form'
        try {
          const error = await response.json()
          console.error('Travel form submission error:', error)
          console.error('Error status:', response.status)
          errorMessage = error.error || error.message || errorMessage
        } catch (e) {
          console.error('Failed to parse error response:', e)
          errorMessage = `Failed to submit travel form (Status: ${response.status})`
        }
        showToast({
          title: 'Submission Failed',
          message: errorMessage,
          type: 'error'
        })
      }
    } catch (error) {
      console.error('Submission failed:', error)
      showToast({
        title: 'Submission Failed',
        message: 'Failed to submit travel form. Please check your connection and try again.',
        type: 'error'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Travel Form Submitted!
          </h2>
          <p className="text-gray-600 mb-6">
            Your travel information has been received and will be processed.
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Submit Another Form
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Travel Information</h1>
            <p className="text-sm sm:text-base text-gray-600">Submit your travel details for Sportograf South America events</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      {...register('name')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Acronym *
                    </label>
                    <input
                      type="text"
                      {...register('acronym')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                      placeholder="e.g., J.D."
                    />
                    {errors.acronym && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.acronym.message}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      {...register('email')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                      placeholder="your@email.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender *
                    </label>
                    <select
                      {...register('gender')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                    >
                      <option value="">Select gender...</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                    {errors.gender && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.gender.message}
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      {...register('phoneNumber', {
                        onChange: (e) => {
                          const formattedValue = formatPhoneNumber(e.target.value)
                          e.target.value = formattedValue
                          return formattedValue
                        }
                      })}
                      className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                      placeholder="(555) 123-4567"
                      maxLength={14}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Format: (555) 123-4567</p>
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Event Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Select Event *
                </label>
                <select
                  {...register('eventId')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                >
                  <option value="" className="text-gray-500">Choose an event...</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title} - {event.location || 'TBD'} ({new Date(event.startDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })})
                    </option>
                  ))}
                </select>
                {errors.eventId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.eventId.message}
                  </p>
                )}
              </div>

              {/* Suggested Flights */}
              {selectedEventSuggestedFlights.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-blue-900 mb-3 flex items-center">
                    <Plane className="h-4 w-4 mr-2" />
                    Suggested Flights for This Event
                  </h3>
                  <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
                    <table className="min-w-full text-[10px] sm:text-xs">
                      <thead className="bg-blue-100">
                        <tr>
                          <th className="px-2 py-1 sm:px-3 sm:py-2 text-left text-[10px] sm:text-xs font-medium text-blue-800 uppercase">From</th>
                          <th className="px-2 py-1 sm:px-3 sm:py-2 text-left text-[10px] sm:text-xs font-medium text-blue-800 uppercase">To</th>
                          <th className="px-2 py-1 sm:px-3 sm:py-2 text-left text-[10px] sm:text-xs font-medium text-blue-800 uppercase">Price</th>
                          <th className="px-2 py-1 sm:px-3 sm:py-2 text-left text-[10px] sm:text-xs font-medium text-blue-800 uppercase">Budget</th>
                          <th className="px-2 py-1 sm:px-3 sm:py-2 text-left text-[10px] sm:text-xs font-medium text-blue-800 uppercase">Screenshot</th>
                          <th className="px-2 py-1 sm:px-3 sm:py-2 text-left text-[10px] sm:text-xs font-medium text-blue-800 uppercase">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-blue-200">
                        {selectedEventSuggestedFlights.map((flight, index) => (
                          <Fragment key={index}>
                            <tr>
                              <td className="px-2 py-1 sm:px-3 sm:py-2 text-gray-900">{flight.from}</td>
                              <td className="px-2 py-1 sm:px-3 sm:py-2 text-gray-900">{flight.to}</td>
                              <td className="px-2 py-1 sm:px-3 sm:py-2 text-gray-900">{flight.price}</td>
                              <td className="px-2 py-1 sm:px-3 sm:py-2 text-gray-900">{flight.budgetAllow}</td>
                              <td className="px-2 py-1 sm:px-3 sm:py-2">
                                {flight.screenshot ? (
                                  <button
                                    type="button"
                                    onClick={() => setExpandedScreenshotIndex(expandedScreenshotIndex === index ? null : index)}
                                    className="cursor-pointer"
                                  >
                                    <img
                                      src={flight.screenshot}
                                      alt="Flight screenshot"
                                      className="w-16 h-12 sm:w-20 sm:h-16 object-cover rounded border border-gray-300 hover:opacity-80 transition-opacity"
                                    />
                                  </button>
                                ) : (
                                  <span className="text-gray-400 text-[10px]">No screenshot</span>
                                )}
                              </td>
                              <td className="px-2 py-1 sm:px-3 sm:py-2">
                                {flight.link ? (
                                  <a
                                    href={flight.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 bg-blue-600 text-white text-[10px] sm:text-xs rounded hover:bg-blue-700 transition-colors"
                                  >
                                    Show Flight
                                  </a>
                                ) : (
                                  <span className="text-gray-400 text-[10px]">No link</span>
                                )}
                              </td>
                            </tr>
                            {expandedScreenshotIndex === index && flight.screenshot && (
                              <tr>
                                <td colSpan={6} className="px-2 py-2 sm:px-3 sm:py-4 bg-blue-50">
                                  <div className="flex flex-col items-center">
                                    <div className="relative inline-block">
                                      <button
                                        type="button"
                                        onClick={() => setExpandedScreenshotIndex(null)}
                                        className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-red-500 text-white rounded-full p-0.5 sm:p-1 hover:bg-red-600 transition-colors"
                                      >
                                        <X className="h-3 w-3 sm:h-4 sm:w-4" />
                                      </button>
                                      <img
                                        src={flight.screenshot}
                                        alt="Flight screenshot full size"
                                        className="max-w-full max-h-48 sm:max-h-64 lg:max-h-96 object-contain rounded border border-gray-300"
                                      />
                                    </div>
                                    <p className="text-[10px] sm:text-xs text-gray-600 mt-1 sm:mt-2">Flight: {flight.from} → {flight.to}</p>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

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
                      {...register('travelMethod')}
                      value="flight"
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 mr-2"
                    />
                    <Plane className="h-4 w-4 mr-2 text-gray-600" />
                    <span className="text-gray-700 font-medium">Flight</span>
                  </label>

                  <label className="flex items-center p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-colors flex-1">
                    <input
                      type="radio"
                      {...register('travelMethod')}
                      value="car"
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 mr-2"
                    />
                    <Car className="h-4 w-4 mr-2 text-gray-600" />
                    <span className="text-gray-700 font-medium">Car/Carpool</span>
                  </label>

                  <label className="flex items-center p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-colors flex-1">
                    <input
                      type="radio"
                      {...register('travelMethod')}
                      value="bus"
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 mr-2"
                    />
                    <Train className="h-4 w-4 mr-2 text-gray-600" />
                    <span className="text-gray-700 font-medium">Bus/Train</span>
                  </label>
                </div>
                {errors.travelMethod && (
                  <p className="mt-1 text-sm text-red-600">
                    Please select a travel method
                  </p>
                )}
              </div>

              {/* Mobile Travel Method Details */}
              <div className="lg:hidden">
                {travelMethod && (
                  <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                    <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                      {travelMethod === 'flight' && <Plane className="h-4 w-4 mr-2 text-blue-600" />}
                      {travelMethod === 'car' && <Car className="h-4 w-4 mr-2 text-blue-600" />}
                      {travelMethod === 'bus' && <Train className="h-4 w-4 mr-2 text-blue-600" />}
                      {travelMethod === 'flight' && 'Flight Details'}
                      {travelMethod === 'car' && 'Driving Details'}
                      {travelMethod === 'bus' && 'Bus/Train Details'}
                    </h3>

                    {/* Flight Details */}
                    {travelMethod === 'flight' && (
                        <div className="space-y-4">
                          {/* Itinerary Selection */}
                          {selectedEventSuggestedFlights.length > 0 && (
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Select Suggested Itinerary</label>
                              <select
                                {...register('selectedItinerary')}
                                className="w-full px-2 py-1 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="">Select an itinerary...</option>
                                {selectedEventSuggestedFlights.map((flight, index) => (
                                  <option key={index} value={index.toString()}>
                                    {flight.from} → {flight.to} (${flight.price})
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {/* Flight Details - All in one panel */}
                          <div className="space-y-3">
                            <div className="text-xs font-semibold text-gray-700 border-b pb-1">Arrive Before Event</div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Flight Number *</label>
                              <input
                                type="text"
                                {...register('arrivalFromEventFlightNumber')}
                                className="w-full px-2 py-1 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
                                placeholder="e.g., AA5678"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Arrival Airport *</label>
                              <input
                                type="text"
                                {...register('arrivalFromEventArrivalAirport')}
                                className="w-full px-2 py-1 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
                                placeholder="e.g., LAX"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Arrival Date *</label>
                                <input
                                  type="date"
                                  {...register('arrivalFromEventArrivalDate')}
                                  className="w-full px-2 py-1 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Arrival Time *</label>
                                <input
                                  type="time"
                                  {...register('arrivalFromEventArrivalTime')}
                                  className="w-full px-2 py-1 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                            </div>

                            <div className="text-xs font-semibold text-gray-700 border-b pb-1 mt-4">Depart After Event</div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Flight Number *</label>
                              <input
                                type="text"
                                {...register('departureFromEventFlightNumber')}
                                className="w-full px-2 py-1 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
                                placeholder="e.g., AA5678"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Departure Airport *</label>
                              <input
                                type="text"
                                {...register('departureFromEventDepartureAirport')}
                                className="w-full px-2 py-1 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
                                placeholder="e.g., LAX"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Departure Date *</label>
                                <input
                                  type="date"
                                  {...register('departureFromEventDepartureDate')}
                                  className="w-full px-2 py-1 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Departure Time *</label>
                                <input
                                  type="time"
                                  {...register('departureFromEventDepartureTime')}
                                  className="w-full px-2 py-1 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Ticket Cost *</label>
                              <input
                                type="number"
                                {...register('ticketCost', {
                                  onChange: (e) => handleTicketCostChange(e.target.value)
                                })}
                                className="w-full px-2 py-1 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
                                placeholder="e.g., 500"
                              />
                              {budgetWarning && (
                                <p className="mt-1 text-xs text-red-600 font-medium">{budgetWarning}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Car Details */}
                      {travelMethod === 'car' && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Driving From</label>
                            <input
                              type="text"
                              {...register('drivingFrom')}
                              className="w-full px-2 py-1 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
                              placeholder="e.g., New York, NY"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Expected Miles</label>
                            <input
                              type="text"
                              {...register('expectedMiles')}
                              className="w-full px-2 py-1 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
                              placeholder="e.g., 250"
                            />
                          </div>
                        </div>
                      )}

                      {/* Bus Details */}
                      {travelMethod === 'bus' && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 gap-2">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Arrival Station</label>
                              <input
                                type="text"
                                {...register('arrivalStation')}
                                className="w-full px-2 py-1 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
                                placeholder="e.g., Penn Station"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Departure Station</label>
                              <input
                                type="text"
                                {...register('departureStation')}
                                className="w-full px-2 py-1 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
                                placeholder="e.g., Union Station"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Arrival Date</label>
                              <input
                                type="date"
                                {...register('busArrivalDate')}
                                className="w-full px-2 py-1 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Arrival Time</label>
                              <input
                                type="time"
                                {...register('busArrivalTime')}
                                className="w-full px-2 py-1 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Departure Date</label>
                              <input
                                type="date"
                                {...register('busDepartureDate')}
                                className="w-full px-2 py-1 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Departure Time</label>
                              <input
                                type="time"
                                {...register('busDepartureTime')}
                                className="w-full px-2 py-1 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                </div>
              )}
              </div>

              {/* Accommodation Section */}
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-purple-500">
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
                          {...register('accommodationNeeded')}
                          value="yes"
                          className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 mr-2"
                        />
                        <span className="text-gray-700">Yes, I need accommodation</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          {...register('accommodationNeeded')}
                          value="no"
                          className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 mr-2"
                        />
                        <span className="text-gray-700">No, I don't need accommodation</span>
                      </label>
                    </div>
                  </div>

                  {watch('accommodationNeeded') === 'yes' && (
                    <div className="space-y-3 pl-6 border-l-2 border-purple-200">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hotel Nights Needed</label>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              value="wednesday"
                              {...register('hotelNights')}
                              className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 mr-2"
                            />
                            <span className="text-gray-700">Wednesday night</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              value="thursday"
                              {...register('hotelNights')}
                              className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 mr-2"
                            />
                            <span className="text-gray-700">Thursday night</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              value="friday"
                              {...register('hotelNights')}
                              className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 mr-2"
                            />
                            <span className="text-gray-700">Friday night</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              value="saturday"
                              {...register('hotelNights')}
                              className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 mr-2"
                            />
                            <span className="text-gray-700">Saturday night</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              value="sunday"
                              {...register('hotelNights')}
                              className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 mr-2"
                            />
                            <span className="text-gray-700">Sunday night</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              value="other"
                              {...register('hotelNights')}
                              className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 mr-2"
                            />
                            <span className="text-gray-700">Other:</span>
                          </label>
                          {watch('hotelNights')?.includes('other') && (
                            <input
                              type="text"
                              {...register('otherHotelNight')}
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

              {/* Special Requests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requests or Comments
                </label>
                <textarea
                  {...register('specialRequests')}
                  rows={3}
                  className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                  placeholder="Any special request..."
                />
              </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => reset()}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Clear Form
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Travel Information'}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column - Travel Method Details */}
            <div className="hidden lg:block lg:sticky lg:top-6 lg:h-fit">
              {travelMethod && (
                <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500 animate-in slide-in-from-right duration-300">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    {travelMethod === 'flight' && <Plane className="h-5 w-5 mr-2 text-blue-600" />}
                    {travelMethod === 'car' && <Car className="h-5 w-5 mr-2 text-blue-600" />}
                    {travelMethod === 'bus' && <Train className="h-5 w-5 mr-2 text-blue-600" />}
                    {travelMethod === 'flight' && 'Flight Details'}
                    {travelMethod === 'car' && 'Driving Details'}
                    {travelMethod === 'bus' && 'Bus/Train Details'}
                  </h3>

                  {/* Flight Details */}
                  {travelMethod === 'flight' && (
                    <div className="space-y-4">
                      {/* Itinerary Selection */}
                      {selectedEventSuggestedFlights.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Select Suggested Itinerary</label>
                          <select
                            {...register('selectedItinerary')}
                            className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select an itinerary...</option>
                            {selectedEventSuggestedFlights.map((flight, index) => (
                              <option key={index} value={index.toString()}>
                                {flight.from} → {flight.to} (${flight.price})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Flight Details - All in one panel */}
                      <div className="space-y-4">
                        <div className="text-sm font-semibold text-gray-700 border-b pb-2">Arrive Before Event</div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Flight Number *</label>
                          <input
                            type="text"
                            {...register('arrivalFromEventFlightNumber')}
                            className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                            placeholder="e.g., AA5678"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Airport *</label>
                          <input
                            type="text"
                            {...register('arrivalFromEventArrivalAirport')}
                            className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                            placeholder="e.g., LAX"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Date *</label>
                            <input
                              type="date"
                              {...register('arrivalFromEventArrivalDate')}
                              className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Time *</label>
                            <input
                              type="time"
                              {...register('arrivalFromEventArrivalTime')}
                              className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div className="text-sm font-semibold text-gray-700 border-b pb-2 mt-4">Depart After Event</div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Flight Number *</label>
                          <input
                            type="text"
                            {...register('departureFromEventFlightNumber')}
                            className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                            placeholder="e.g., AA5678"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Departure Airport *</label>
                          <input
                            type="text"
                            {...register('departureFromEventDepartureAirport')}
                            className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                            placeholder="e.g., LAX"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Departure Date *</label>
                            <input
                              type="date"
                              {...register('departureFromEventDepartureDate')}
                              className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Departure Time *</label>
                            <input
                              type="time"
                              {...register('departureFromEventDepartureTime')}
                              className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Cost *</label>
                          <input
                            type="number"
                            {...register('ticketCost', {
                              onChange: (e) => handleTicketCostChange(e.target.value)
                            })}
                            className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                            placeholder="e.g., 500"
                          />
                          {budgetWarning && (
                            <p className="mt-1 text-sm text-red-600 font-medium">{budgetWarning}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Car Details */}
                  {travelMethod === 'car' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Driving From</label>
                        <input
                          type="text"
                          {...register('drivingFrom')}
                          className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                          placeholder="e.g., Home address, city, state"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expected Miles</label>
                        <input
                          type="number"
                          {...register('expectedMiles')}
                          className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                          placeholder="e.g., 250"
                          min="1"
                        />
                      </div>
                    </div>
                  )}

                  {/* Bus Details */}
                  {travelMethod === 'bus' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Station</label>
                          <input
                            type="text"
                            {...register('arrivalStation')}
                            className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                            placeholder="e.g., Union Station, LA"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Departure Station</label>
                          <input
                            type="text"
                            {...register('departureStation')}
                            className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                            placeholder="e.g., Penn Station, NYC"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Date</label>
                          <input
                            type="date"
                            {...register('busArrivalDate')}
                            className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Time</label>
                          <input
                            type="time"
                            {...register('busArrivalTime')}
                            className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Departure Date</label>
                          <input
                            type="date"
                            {...register('busDepartureDate')}
                            className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Departure Time</label>
                          <input
                            type="time"
                            {...register('busDepartureTime')}
                            className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                          />
                        </div>
                      </div>

                      {/* Ticket Cost */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Cost (€)</label>
                        <input
                          type="text"
                          {...register('ticketCost')}
                          className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                          placeholder="Enter ticket cost"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!travelMethod && (
                <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <div className="text-gray-400 mb-2">
                      <svg className="h-12 w-12 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-600 mb-1">Select a Travel Method</h3>
                    <p className="text-sm text-gray-500">Choose your travel method to see specific details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
