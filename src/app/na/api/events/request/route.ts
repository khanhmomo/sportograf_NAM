import { NextRequest, NextResponse } from 'next/server'
import { getEventsCollection, getRegistrationsCollection } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { sendEmail, getEventRequestConfirmationEmail } from '@/lib/email'

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

    // Check if user already requested this event by email or acronym
    const existingRequest = await registrationsCollection.findOne({
      eventId: new ObjectId(eventId),
      $or: [
        { email: userInfo.email.toLowerCase() },
        { acronym: userInfo.acronym?.toUpperCase() }
      ]
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You have already requested this event' },
        { status: 409 }
      )
    }

    // Create the registration request
    const newRequest = {
      eventId: new ObjectId(eventId),
      name: userInfo.name,
      acronym: userInfo.acronym || '',
      email: userInfo.email.toLowerCase(),
      phoneNumber: userInfo.phoneNumber,
      eventTitle: event.title,
      status: 'pending', // pending, approved, rejected
      createdAt: new Date()
    }

    const result = await registrationsCollection.insertOne(newRequest)

    // Send confirmation email
    try {
      await sendEmail({
        to: userInfo.email.toLowerCase(),
        subject: 'Event Request Confirmation',
        html: getEventRequestConfirmationEmail(userInfo.name, event.title)
      })
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
      // Don't fail the request if email fails, just log it
    }

    return NextResponse.json({
      id: result.insertedId.toString(),
      ...newRequest,
      eventId: newRequest.eventId.toString()
    }, { status: 201 })

  } catch (error) {
    console.error('Failed to create event request:', error)
    return NextResponse.json(
      { error: 'Failed to create event request' },
      { status: 500 }
    )
  }
}
