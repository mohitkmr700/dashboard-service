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
    
    
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Auth service error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        headers: Object.fromEntries(response.headers.entries())
      });
      return NextResponse.json(
        { error: `Auth service error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();

    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Server-side error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    
    console.log('Signup request - Token found:', !!accessToken);
    if (accessToken) {
      // Decode and log token info for debugging
      try {
        const tokenParts = accessToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
          console.log('Token payload:', {
            exp: payload.exp,
            currentTime: Math.floor(Date.now() / 1000),
            isExpired: payload.exp < Math.floor(Date.now() / 1000),
            email: payload.email,
            role: payload.role
          });
        }
      } catch (e) {
        console.error('Could not decode token',e);
      }
    }
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'No access token found' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Log the request for debugging
    console.log('Signup request:', {
      url: `${authDomain}/signup`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `access_token=${accessToken}`,
        'Authorization': `Bearer ${accessToken}`,
        'X-Access-Token': accessToken,
      },
      body: body
    });
    
    const response = await fetch(`${authDomain}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `access_token=${accessToken}`,
        'Authorization': `Bearer ${accessToken}`,
        'X-Access-Token': accessToken,
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Auth service error:', errorText);
      return NextResponse.json(
        { error: `Auth service error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 