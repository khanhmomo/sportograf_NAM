import { NextRequest, NextResponse } from 'next/server'
import { getRegistrationsCollection } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { noted } = body

    const registrationsCollection = await getRegistrationsCollection()
    
    const result = await registrationsCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          noted: noted,
          notedAt: noted ? new Date() : null
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      id,
      noted,
      message: `Registration ${noted ? 'noted' : 'unnoted'} successfully` 
    })
  } catch (error) {
    console.error('Failed to update registration note:', error)
    return NextResponse.json(
      { error: 'Failed to update registration note' },
      { status: 500 }
    )
  }
}
