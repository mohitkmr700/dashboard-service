import { NextResponse } from 'next/server';

const API_DOMAIN = process.env.NEXT_PUBLIC_API_DOMAIN;

interface ApiResponse {
  statusCode: number;
  message: string;
  data: Array<{
    collectionId: string;
    collectionName: string;
    created: string;
    deadline: string;
    description: string;
    email: string;
    id: string;
    is_done: boolean;
    progress: number;
    title: string;
    updated: string;
  }>;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  try {
    const apiUrl = `${API_DOMAIN}/list=all?email=${encodeURIComponent(email)}`;

    
    const response = await fetch(apiUrl, {
      headers: {
        'accept': '*/*',
        'accept-language': 'en-GB,en;q=0.9',
        'dnt': '1',
        'priority': 'u=1, i',
        'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
      }
    });

    
    
    if (!response.ok) {
      
      return NextResponse.json(
        { error: `API request failed: ${response.status}` },
        { status: response.status }
      );
    }

    const responseData = await response.json() as ApiResponse;
    
    
    // Return the data array directly
    return NextResponse.json(responseData.data || []);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
} 