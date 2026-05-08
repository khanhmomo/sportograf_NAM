import { NextRequest, NextResponse } from 'next/server'
import { getTravelFormsCollection } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET() {
  try {
    const travelFormsCollection = await getTravelFormsCollection()
    const forms = await travelFormsCollection.find({}).toArray()
    
    // Convert ObjectId to string for JSON serialization
    const serializedForms = forms.map(form => ({
      ...form,
      id: form._id.toString(),
      _id: undefined
    }))
    
    return NextResponse.json(serializedForms)
  } catch (error) {
    console.error('Failed to fetch travel forms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch travel forms' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const travelFormsCollection = await getTravelFormsCollection()
    
    // Check for duplicate by email or acronym for the same event
    const existingForm = await travelFormsCollection.findOne({
      $and: [
        {
          $or: [
            { email: body.email.toLowerCase() },
            { acronym: body.acronym?.toUpperCase() }
          ]
        },
        { eventId: body.eventId }
      ]
    })
    
    if (existingForm) {
      return NextResponse.json(
        { error: 'A travel form has already been submitted for this event with this email or acronym' },
        { status: 409 }
      )
    }
    
    // Create new travel form
    const newForm = {
      ...body,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await travelFormsCollection.insertOne(newForm)
    
    return NextResponse.json({
      id: result.insertedId.toString(),
      message: 'Travel form submitted successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to submit travel form:', error)
    return NextResponse.json(
      { error: 'Failed to submit travel form' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Travel form ID is required' },
        { status: 400 }
      )
    }
    
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
