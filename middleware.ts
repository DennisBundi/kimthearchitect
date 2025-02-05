import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Make sure your middleware isn't accidentally blocking all routes
  return NextResponse.next()
} 