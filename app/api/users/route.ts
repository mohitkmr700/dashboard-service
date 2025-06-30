import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN;
    
    if (!authDomain) {
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_AUTH_DOMAIN environment variable is not configured' },
        { status: 500 }
      );
    }
    
    // Get the access token from cookies
    const accessToken = request.cookies.get('access_token')?.value;
    
    // console.log('Server-side API call to:', `${authDomain}/user/profiles`);
    // console.log('Token available:', !!accessToken);
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'No access token found' },
        { status: 401 }
      );
    }
    
    const response = await fetch(`${authDomain}/user/profiles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `access_token=${accessToken}`,
        'Authorization': `Bearer ${accessToken}`,
        'X-Access-Token': accessToken,
      },
    });
    
    // console.log('Auth service response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Auth service error:', errorText);
      return NextResponse.json(
        { error: `Auth service error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log('Users API response structure:', {
      isArray: Array.isArray(data),
      hasData: data && typeof data === 'object',
      keys: data ? Object.keys(data) : [],
      dataType: typeof data,
      dataLength: Array.isArray(data) ? data.length : 'not array'
    });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Server-side error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 