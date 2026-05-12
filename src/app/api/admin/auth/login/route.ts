import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Admin credentials (in production, these should be in environment variables)
const ADMIN_CREDENTIALS = [
  { username: 'giangpham', password: 'sportograf@admin', role: 'admin' },
  { username: 'team-leader', password: 'sportograf@leader', role: 'team-leader' }
]
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Validate credentials
    const admin = ADMIN_CREDENTIALS.find(
      cred => cred.username === username && cred.password === password
    )

    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        username: admin.username,
        role: admin.role,
        loginTime: Date.now()
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Set HTTP-only cookie
    const response = NextResponse.json({
      message: 'Login successful',
      token: token,
      role: admin.role
    })

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
