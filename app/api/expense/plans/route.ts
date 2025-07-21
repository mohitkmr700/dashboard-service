import { NextResponse } from 'next/server';

const API_DOMAIN = process.env.NEXT_PUBLIC_AUTH_DOMAIN;

export async function GET(request: Request) {
  try {
    console.log('Environment variables:', {
      API_DOMAIN: API_DOMAIN,
      NEXT_PUBLIC_AUTH_DOMAIN: process.env.NEXT_PUBLIC_AUTH_DOMAIN
    });
    
    if (!API_DOMAIN) {
      console.error('API_DOMAIN is not configured');
      return NextResponse.json(
        { error: 'API domain not configured. Please check NEXT_PUBLIC_AUTH_DOMAIN environment variable.' },
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
    const apiUrl = `${API_DOMAIN}/expense/plans`;
    
    console.log('Making API call to:', apiUrl);
    console.log('Token length:', token.length);
    console.log('API Domain:', API_DOMAIN);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `access_token=${token}`,
      },
    });

    if (!response.ok) {
      console.error('Backend API error:', {
        status: response.status,
        statusText: response.statusText,
        url: apiUrl
      });
      
      // Try to get error details from response
      let errorMessage = `API request failed: ${response.status}`;
      try {
        const errorData = await response.text();
        console.error('Backend error response:', errorData);
        errorMessage = errorData || errorMessage;
      } catch (e) {
        console.error('Could not read error response:', e);
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching expense plans:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch expense plans';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 