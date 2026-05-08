import { NextRequest, NextResponse } from 'next/server'
import { getEventsCollection, getRegistrationsCollection } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const registrationsCollection = await getRegistrationsCollection()
    
    // Get all registrations for this event
    const registrations = await registrationsCollection.find({ 
      eventId: new ObjectId(id) 
    }).toArray()
    
    // Transform the data to match the expected format
    const formattedRegistrations = registrations.map(reg => ({
      _id: reg._id.toString(),
      name: reg.name,
      acronym: reg.acronym,
      email: reg.email,
      phoneNumber: reg.phoneNumber,
      eventId: reg.eventId.toString(),
      event: {
        title: reg.eventTitle || 'Event'
      },
      noted: reg.noted || false,
      notedAt: reg.notedAt,
      createdAt: reg.createdAt
    }))
    
    return NextResponse.json(formattedRegistrations)
  } catch (error) {
    console.error('Failed to fetch registrations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const registrationsCollection = await getRegistrationsCollection()
    const body = await request.json()
    
    // Create a new registration
    const newRegistration = {
      eventId: new ObjectId(id),
      name: body.name,
      acronym: body.acronym,
      email: body.email,
      phoneNumber: body.phoneNumber,
      eventTitle: body.eventTitle || 'Event',
      createdAt: new Date()
    }
    
    const result = await registrationsCollection.insertOne(newRegistration)
    
    return NextResponse.json({
      _id: result.insertedId.toString(),
      ...newRegistration,
      eventId: newRegistration.eventId.toString()
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create registration:', error)
    return NextResponse.json(
      { error: 'Failed to create registration' },
      { status: 500 }
    )
  }
}
