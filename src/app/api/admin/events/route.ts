import { NextResponse } from 'next/server'
import { getEventsCollection, getRegistrationsCollection } from '@/lib/mongodb'

export async function GET() {
  try {
    const eventsCollection = await getEventsCollection()
    const events = await eventsCollection.find({}).toArray()
    
    // Add registration counts to each event
    const eventsWithCounts = await Promise.all(
      events.map(async (event: any) => {
        const registrationsCollection = await getRegistrationsCollection()
        const registrationCount = await registrationsCollection.countDocuments({ 
          eventId: event._id 
        })
        
        return {
          ...event,
          id: event._id?.toString(),
          _count: {
            eventRegistrations: registrationCount
          }
        }
      })
    )
    
    return NextResponse.json(eventsWithCounts)
  } catch (error) {
    console.error('Failed to fetch admin events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}
