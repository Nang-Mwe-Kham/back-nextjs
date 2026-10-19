import { NextResponse } from 'next/server';
import { getUsersList, createUser } from '@/lib/userService';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const department = searchParams.get('department') || '';
    const status = searchParams.get('status') || '';

    const users = await getUsersList({ search, role, department, status });

    return NextResponse.json(
      { success: true, count: users.length, data: users },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.name || !body.email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required fields.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const newUser = await createUser(body);

    return NextResponse.json(
      { success: true, message: 'User created successfully', data: newUser },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500, headers: corsHeaders }
    );
  }
}
