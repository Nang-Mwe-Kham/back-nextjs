import { NextResponse } from 'next/server';
import { resetToSeed } from '@/lib/userService';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST() {
  try {
    const users = await resetToSeed();
    return NextResponse.json(
      { success: true, message: 'Reset database to demo seed data', data: users },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error seeding users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset seed data' },
      { status: 500, headers: corsHeaders }
    );
  }
}
