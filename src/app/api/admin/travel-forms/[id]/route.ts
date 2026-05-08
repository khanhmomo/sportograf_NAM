import { NextRequest, NextResponse } from 'next/server'
import { getTravelFormsCollection } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const travelFormsCollection = await getTravelFormsCollection()
    
    // Update the travel form
    const result = await travelFormsCollection.updateOne(
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
        { error: 'Travel form not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      message: 'Travel form updated successfully'
    })
  } catch (error) {
    console.error('Failed to update travel form:', error)
    return NextResponse.json(
      { error: 'Failed to update travel form' },
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
    
    const travelFormsCollection = await getTravelFormsCollection()
    
    const result = await travelFormsCollection.deleteOne({
      _id: new ObjectId(id)
    })
    
    if (result.deletedCount === 0) {
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
