import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params;

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

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

    const response = await fetch(`${authDomain}/expense/plan/${encodeURIComponent(planId)}/is_active`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `access_token=${accessToken}`,
        'Authorization': `Bearer ${accessToken}`,
        'X-Access-Token': accessToken,
      },
      body: JSON.stringify({ is_active: true }),
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
    console.error('Error activating expense plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 