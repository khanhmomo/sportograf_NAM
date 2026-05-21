import { NextRequest, NextResponse } from 'next/server'
import { getEventsCollection, getRegistrationsCollection } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, userInfo } = body

    // Validate required fields
    if (!eventId || !userInfo) {
      return NextResponse.json(
        { error: 'Event ID and user information are required' },
        { status: 400 }
      )
    }

    // Validate user info
    if (!userInfo.name || !userInfo.email || !userInfo.phoneNumber) {
      return NextResponse.json(
        { error: 'Name, email, and phone number are required' },
        { status: 400 }
      )
    }

    const eventsCollection = await getEventsCollection()
    const registrationsCollection = await getRegistrationsCollection()

    // Check if event exists
    const event = await eventsCollection.findOne({ _id: new ObjectId(eventId) })
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Check if user already registered for this event by email or acronym
    const existingRegistration = await registrationsCollection.findOne({
      eventId: new ObjectId(eventId),
      $or: [
        { email: userInfo.email.toLowerCase() },
        { acronym: userInfo.acronym?.toUpperCase() }
      ]
    })

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'You have already registered for this event' },
        { status: 409 }
      )
    }

    // Create the registration
    const newRegistration = {
      eventId: new ObjectId(eventId),
      name: userInfo.name,
      acronym: userInfo.acronym || '',
      email: userInfo.email.toLowerCase(),
      phoneNumber: userInfo.phoneNumber,
      eventTitle: event.title,
      status: 'registered',
      createdAt: new Date()
    }

    const result = await registrationsCollection.insertOne(newRegistration)

    return NextResponse.json({
      id: result.insertedId.toString(),
      ...newRegistration,
      eventId: newRegistration.eventId.toString()
    }, { status: 201 })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to register for event' },
      { status: 500 }
    )
  }
}
