import { NextRequest, NextResponse } from 'next/server'
import { getRegistrationsCollection } from '@/lib/mongodb'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const registrationsCollection = await getRegistrationsCollection()
    
    // Delete all registrations for this event
    const result = await registrationsCollection.deleteMany({ 
      eventId: id 
    })
    
    return NextResponse.json({ 
      message: `Deleted ${result.deletedCount} registrations for event ${id}`,
      deletedCount: result.deletedCount
    })
  } catch (error) {
    console.error('Failed to clear registrations:', error)
    return NextResponse.json(
      { error: 'Failed to clear registrations' },
      { status: 500 }
    )
  }
}
