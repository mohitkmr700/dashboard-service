import { NextResponse } from 'next/server';

const API_DOMAIN = process.env.NEXT_PUBLIC_AUTH_DOMAIN;



export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { month, year, prompt } = body;

    if (!month || !year) {
      return NextResponse.json(
        { error: 'Month and year are required' },
        { status: 400 }
      );
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
    const apiUrl = `${API_DOMAIN}/expense/plan/sync`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `access_token=${token}`,
      },
      body: JSON.stringify({ month, year, prompt }),
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
    console.error('Error syncing expense plan:', error);
    return NextResponse.json(
      { error: 'Failed to sync expense plan' },
      { status: 500 }
    );
  }
} 