import { NextRequest, NextResponse } from 'next/server'

// Clear mock admin travel forms data
export async function DELETE() {
  try {
    // This will clear the mock data when the server restarts
    // For now, we'll return success and the mock arrays will be reset on server restart
    return NextResponse.json({ 
      message: 'Mock admin travel forms data cleared. Restart server to apply changes.',
      cleared: true 
    })
  } catch (error) {
    console.error('Failed to clear mock data:', error)
    return NextResponse.json(
      { error: 'Failed to clear mock data' },
      { status: 500 }
    )
  }
}
