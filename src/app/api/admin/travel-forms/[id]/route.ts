import { NextRequest, NextResponse } from 'next/server'

// Mock storage - same as travel API
let mockTravelForms: any[] = []

// Initialize with existing data (in a real app, this would come from database)
const initializeMockData = async () => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/travel`)
    if (response.ok) {
      mockTravelForms = await response.json()
    }
  } catch (error) {
    console.error('Failed to initialize mock data:', error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Initialize mock data if needed
    if (mockTravelForms.length === 0) {
      await initializeMockData()
    }

    const { id } = await params
    
    // Find and delete the travel form
    const initialLength = mockTravelForms.length
    mockTravelForms = mockTravelForms.filter(form => form.id !== id)
    
    if (mockTravelForms.length === initialLength) {
      return NextResponse.json(
        { error: 'Travel form not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      message: 'Travel form deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete travel form:', error)
    return NextResponse.json(
      { error: 'Failed to delete travel form' },
      { status: 500 }
    )
  }
}
