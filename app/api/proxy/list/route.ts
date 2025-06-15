import { NextResponse } from 'next/server';
import { Task } from '../../../../lib/types';

const API_DOMAIN = process.env.NEXT_PUBLIC_API_DOMAIN;

interface ApiResponse {
  statusCode: number;
  message: string;
  data: Task[];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`${API_DOMAIN}/list=all?email=${encodeURIComponent(email)}`, {
      headers: {
        'accept': '*/*',
        'accept-language': 'en-GB,en;q=0.9',
        'dnt': '1',
        'priority': 'u=1, i',
        'referer': 'http://localhost:3000/',
        'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
      }
    });

    const responseData = await response.json() as ApiResponse;
    return NextResponse.json(responseData.data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
} 