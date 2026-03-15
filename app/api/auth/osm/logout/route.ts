// app/api/auth/osm/logout/route.ts

import { NextResponse } from 'next/server';

export async function GET() {
  // Gunakan NEXTAUTH_URL agar redirect ke URL yang benar
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

  const response = NextResponse.redirect(`${baseUrl}/`);
  response.cookies.delete('osm_access_token');
  response.cookies.delete('osm_user');
  return response;
}