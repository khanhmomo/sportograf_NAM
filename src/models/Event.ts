import { ObjectId } from 'mongodb'

export interface Event {
  _id?: ObjectId
  title: string
  description?: string
  location?: string
  startDate: Date
  endDate?: Date
  maxCapacity?: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface EventRegistration {
  _id?: ObjectId
  eventId: ObjectId
  name: string
  acronym: string
  email: string
  phoneNumber: string
  createdAt: Date
}

export interface TravelForm {
  _id?: ObjectId
  eventId: ObjectId
  name: string
  email: string
  phoneNumber: string
  travelMethod: 'flight' | 'car' | 'bus'
  // Flight specific fields
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
  // Car/Carpool specific fields
  drivingFrom?: string
  expectedMiles?: string
  // Bus specific fields
  arrivalStation?: string
  departureStation?: string
  busArrivalDate?: string
  busArrivalTime?: string
  busDepartureDate?: string
  busDepartureTime?: string
  // Accommodation request
  accommodationNeeded?: 'yes' | 'no'
  checkInDate?: string
  checkOutDate?: string
  specialRequests?: string
  createdAt: Date
}
