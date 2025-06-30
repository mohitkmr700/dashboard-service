import { NextResponse } from 'next/server';

const API_DOMAIN = process.env.NEXT_PUBLIC_API_DOMAIN;

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_DOMAIN}/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'sec-ch-ua-platform': '"macOS"',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
        'sec-ch-ua': '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
        'DNT': '1',
        'sec-ch-ua-mobile': '?0'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
} 