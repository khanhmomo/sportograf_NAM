import { NextResponse } from 'next/server'
import { getEventsCollection, getRegistrationsCollection, getTravelFormsCollection } from '@/lib/mongodb'

export async function GET() {
  try {
    const eventsCollection = await getEventsCollection()
    const registrationsCollection = await getRegistrationsCollection()
    const travelFormsCollection = await getTravelFormsCollection()
    
    // Get real statistics from database
    const [totalEvents, totalRegistrations, pendingTravelForms] = await Promise.all([
      eventsCollection.countDocuments(),
      registrationsCollection.countDocuments(),
      travelFormsCollection.countDocuments({ status: 'PENDING' })
    ])
    
    return NextResponse.json({
      totalEvents,
      totalRegistrations,
      pendingTravelForms,
    })
  } catch (error) {
    console.error('Failed to fetch admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
