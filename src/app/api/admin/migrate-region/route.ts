import { NextRequest, NextResponse } from 'next/server'
import { getEventsCollection } from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const eventsCollection = await getEventsCollection()

    // Get all events without region field
    const eventsWithoutRegion = await eventsCollection.find({ region: { $exists: false } }).toArray()

    if (eventsWithoutRegion.length === 0) {
      return NextResponse.json({
        message: 'All events already have region field',
        migratedCount: 0
      })
    }

    // Update all events without region to 'na' (North America)
    const result = await eventsCollection.updateMany(
      { region: { $exists: false } },
      { $set: { region: 'na' } }
    )

    return NextResponse.json({
      message: 'Migration completed successfully',
      migratedCount: result.modifiedCount,
      totalEvents: eventsWithoutRegion.length
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: 'Migration failed', details: error },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const eventsCollection = await getEventsCollection()

    // Count events with and without region field
    const totalEvents = await eventsCollection.countDocuments()
    const eventsWithoutRegion = await eventsCollection.countDocuments({ region: { $exists: false } })
    const eventsWithRegion = await eventsCollection.countDocuments({ region: { $exists: true } })

    return NextResponse.json({
      totalEvents,
      eventsWithoutRegion,
      eventsWithRegion,
      needsMigration: eventsWithoutRegion > 0
    })
  } catch (error) {
    console.error('Error checking migration status:', error)
    return NextResponse.json(
      { error: 'Failed to check migration status' },
      { status: 500 }
    )
  }
}
