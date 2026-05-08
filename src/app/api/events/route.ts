import { NextRequest, NextResponse } from 'next/server'
import { getEventsCollection, getRegistrationsCollection, getTravelFormsCollection } from '@/lib/mongodb'
import { Event } from '@/models/Event'

export async function GET() {
  try {
    const eventsCollection = await getEventsCollection()
    const events = await eventsCollection.find({}).toArray()
    
    // Add registration and travel form counts to each event
    const eventsWithCounts = await Promise.all(
      events.map(async (event: any) => {
        const registrationsCollection = await getRegistrationsCollection()
        const travelFormsCollection = await getTravelFormsCollection()
        
        const [registrationCount, travelFormCount] = await Promise.all([
          registrationsCollection.countDocuments({ eventId: event._id }),
          travelFormsCollection.countDocuments({ eventId: event._id.toString() })
        ])
        
        return {
          ...event,
          id: event._id?.toString(),
          _count: {
            eventRegistrations: registrationCount,
            travelForms: travelFormCount
          }
        }
      })
    )
    
    return NextResponse.json(eventsWithCounts)
  } catch (error) {
    console.error('Failed to fetch events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const eventsCollection = await getEventsCollection()
    
    const newEvent: Omit<Event, '_id' | 'createdAt' | 'updatedAt'> = {
      title: body.title,
      description: undefined,
      location: body.location || undefined,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      maxCapacity: undefined,
      isActive: true,
      suggestedFlights: body.suggestedFlights || undefined
    }
    
    const result = await eventsCollection.insertOne({
      ...newEvent,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    return NextResponse.json({
      id: result.insertedId.toString(),
      ...newEvent,
      createdAt: new Date(),
      updatedAt: new Date()
    }, { status: 201 })
    
  } catch (error) {
    console.error('Failed to create event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}
