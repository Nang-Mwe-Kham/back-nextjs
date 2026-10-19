import { NextResponse } from 'next/server';
import { bulkUpdateStatus, bulkDeleteUsers } from '@/lib/userService';

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

export async function POST(request) {
  try {
    const { action, ids, status } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User IDs array is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (action === 'status') {
      if (!status) {
        return NextResponse.json(
          { success: false, error: 'Target status is required' },
          { status: 400, headers: corsHeaders }
        );
      }
      const res = await bulkUpdateStatus(ids, status);
      return NextResponse.json(
        { success: true, message: `Updated status for ${ids.length} users`, ...res },
        { headers: corsHeaders }
      );
    }

    if (action === 'delete') {
      const res = await bulkDeleteUsers(ids);
      return NextResponse.json(
        { success: true, message: `Deleted ${ids.length} users`, ...res },
        { headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Invalid bulk action. Allowed: status, delete' },
      { status: 400, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error in bulk operation:', error);
    return NextResponse.json(
      { success: false, error: 'Bulk operation failed' },
      { status: 500, headers: corsHeaders }
    );
  }
}
