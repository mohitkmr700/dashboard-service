import { NextResponse } from 'next/server';

const API_DOMAIN = process.env.NEXT_PUBLIC_AUTH_DOMAIN;



export async function GET(
  request: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params;

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    if (!API_DOMAIN) {
      return NextResponse.json(
        { error: 'API domain not configured' },
        { status: 500 }
      );
    }

    // Get authorization header from the request
    const authHeader = request.headers.get('authorization');
    
    // Extract token from Bearer format
    const token = authHeader?.replace('Bearer ', '') || '';

    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token is required' },
        { status: 401 }
      );
    }

    // Make API call to backend - using the correct endpoint format
    const apiUrl = `${API_DOMAIN}/expense/plan/variance-history/${encodeURIComponent(planId)}`;
    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `access_token=${token}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `API request failed: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching variance history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch variance history' },
      { status: 500 }
    );
  }
} 