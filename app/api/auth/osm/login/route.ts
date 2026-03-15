// app/api/auth/osm/login/route.ts
import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export async function GET() {
  const state = randomBytes(16).toString('hex');

  const params = new URLSearchParams({
    client_id: process.env.OSM_CLIENT_ID!,
    redirect_uri: process.env.OSM_REDIRECT_URI!,
    response_type: 'code',
    scope: 'read_prefs write_api',
    state,
  });

  // OAuth endpoint ada di www.openstreetmap.org
  const authUrl = `${process.env.OSM_OAUTH_URL}/oauth2/authorize?${params.toString()}`;

  const response = NextResponse.redirect(authUrl);
  response.cookies.set('osm_oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
  });

  return response;
}