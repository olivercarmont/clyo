import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ticker_symbol = searchParams.get('ticker_symbol');
  const api_key = process.env.POLYGON_API_KEY; // Use server-side environment variable
  const limit = searchParams.get('limit') || '20';
  const days_forward = searchParams.get('days_forward') || '14';
  const contract_type = searchParams.get('contract_type') || 'call';

  if (!ticker_symbol) {
    return NextResponse.json({ error: 'ticker_symbol is required' }, { status: 400 });
  }

  const apiUrl = 'https://wg2rfvqgbqsxc6ucdfnqldlzoa0buncf.lambda-url.us-east-1.on.aws/';
  console.log(api_key);

  try {
    console.log(ticker_symbol)
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ticker_symbol': ticker_symbol,
        'api_key': api_key || '',
        'limit': limit,
        'days_forward': days_forward,
        'contract_type': contract_type
      },
    });

    const data = await response.json();
    console.log(data);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error fetching from external API:', error);
    return NextResponse.json({ error: 'Failed to fetch data from external API' }, { status: 500 });
  }
}