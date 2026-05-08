import { NextRequest, NextResponse } from 'next/server'
import { getRegistrationsCollection } from '@/lib/mongodb'

export async function DELETE() {
  try {
    const registrationsCollection = await getRegistrationsCollection()
    
    // Delete all registrations
    const result = await registrationsCollection.deleteMany({})
    
    return NextResponse.json({ 
      message: `Deleted ${result.deletedCount} registrations`,
      deletedCount: result.deletedCount
    })
  } catch (error) {
    console.error('Failed to clear all registrations:', error)
    return NextResponse.json(
      { error: 'Failed to clear registrations' },
      { status: 500 }
    )
  }
}
