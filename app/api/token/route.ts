import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get the access token from cookies
    const accessToken = request.cookies.get('access_token')?.value;
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'No access token found in cookies' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      token: accessToken,
      message: 'Token retrieved successfully'
    });
  } catch (error) {
    console.error('Token API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 