// app/api/auth/osm/logout/route.ts

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL('/', request.url));
  response.cookies.delete('osm_access_token');
  response.cookies.delete('osm_user');
  return response;
}