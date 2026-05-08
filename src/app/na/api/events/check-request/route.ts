import { NextRequest, NextResponse } from 'next/server'
import { getRegistrationsCollection } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, email, acronym } = body

    if (!eventId || !email) {
      return NextResponse.json(
        { error: 'Event ID and email are required' },
        { status: 400 }
      )
    }

    const registrationsCollection = await getRegistrationsCollection()
    
    // Check if user already requested this event by email or acronym
    const existingRequest = await registrationsCollection.findOne({
      eventId: new ObjectId(eventId),
      $or: [
        { email: email.toLowerCase() },
        { acronym: acronym?.toUpperCase() }
      ]
    })

    return NextResponse.json({ 
      exists: !!existingRequest 
    })
  } catch (error) {
    console.error('Failed to check request:', error)
    return NextResponse.json(
      { error: 'Failed to check request' },
      { status: 500 }
    )
  }
}
