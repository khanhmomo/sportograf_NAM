import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, userInfo } = body

    // Mock implementation that logs the user info for admin visibility
    console.log('Registration received:', {
      eventId,
      userInfo,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({ 
      id: 'mock-registration-id',
      message: 'Successfully registered for event (mock)',
      userInfo: userInfo // Return user info for confirmation
    }, { status: 201 })
  } catch (error) {
    console.error('Registration failed:', error)
    return NextResponse.json(
      { error: 'Failed to register for event' },
      { status: 500 }
    )
  }
}
