import { NextResponse } from 'next/server';

export const GET = async () => {
  try {
    return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ status: 'error', message: 'Health check failed' }, { status: 500 });
  }
};
