import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const headersList = await headers();
  const correlationId = headersList.get('x-correlation-id');
  
  console.log(`[${correlationId}] Processing request...`);
  return NextResponse.json({ status: 'ok', correlationId });
}