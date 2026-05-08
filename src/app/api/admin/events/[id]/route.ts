import { NextRequest, NextResponse } from 'next/server'
import { getEventsCollection, getRegistrationsCollection, getTravelFormsCollection } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const eventsCollection = await getEventsCollection()
    const body = await request.json()
    
    const result = await eventsCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...body,
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      id: id,
      message: 'Event updated successfully' 
    })
  } catch (error) {
    console.error('Failed to update event:', error)
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const eventsCollection = await getEventsCollection()
    const registrationsCollection = await getRegistrationsCollection()
    const travelFormsCollection = await getTravelFormsCollection()
    
    // First, delete all registrations for this event
    await registrationsCollection.deleteMany({ 
      eventId: new ObjectId(id) 
    })
    
    // Then, delete all travel forms for this event
    await travelFormsCollection.deleteMany({ 
      eventId: new ObjectId(id) 
    })
    
    // Finally, delete the event
    const result = await eventsCollection.deleteOne({ 
      _id: new ObjectId(id) 
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Event and all related data deleted successfully' 
    })
  } catch (error) {
    console.error('Failed to delete event:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}
