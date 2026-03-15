// app/api/auth/osm/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.NEXTAUTH_URL!;
const OAUTH_URL = process.env.OSM_OAUTH_URL!;   // www.openstreetmap.org
const API_URL = process.env.OSM_API_URL!;        // api.openstreetmap.org

const clearState = (res: NextResponse) => {
  res.cookies.delete('osm_oauth_state');
  return res;
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const cookieState = request.cookies.get('osm_oauth_state')?.value;

  // User klik Deny
  if (error === 'access_denied') {
    return clearState(NextResponse.redirect(`${BASE_URL}/?login=cancelled`));
  }
  if (error) {
    return clearState(NextResponse.redirect(`${BASE_URL}/?login=failed`));
  }

  // Verifikasi CSRF state
  if (!state || !cookieState || state !== cookieState) {
    return clearState(NextResponse.redirect(`${BASE_URL}/?login=failed`));
  }
  if (!code) {
    return clearState(NextResponse.redirect(`${BASE_URL}/?login=failed`));
  }

  try {
    // Tukar code dengan token — endpoint di www.openstreetmap.org
    const tokenRes = await fetch(`${OAUTH_URL}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.OSM_REDIRECT_URI!,
        client_id: process.env.OSM_CLIENT_ID!,
        client_secret: process.env.OSM_CLIENT_SECRET!,
      }),
    });

    if (!tokenRes.ok) {
      const body = await tokenRes.text();
      console.error('Token exchange failed:', tokenRes.status, body);
      throw new Error(`Token exchange failed: ${tokenRes.status}`);
    }

    const { access_token } = await tokenRes.json();

    // Fetch info user — endpoint di api.openstreetmap.org
    const userRes = await fetch(`${API_URL}/api/0.6/user/details.json`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!userRes.ok) throw new Error('Gagal fetch user details');

    const { user } = await userRes.json();

    const response = NextResponse.redirect(`${BASE_URL}/?login=success`);

    // Simpan token di httpOnly cookie (aman, tidak bisa dibaca JS)
    response.cookies.set('osm_access_token', access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
    });

    // Simpan info user di cookie biasa (bisa dibaca JS untuk tampilkan nama)
    response.cookies.set('osm_user', JSON.stringify({ id: user.id, name: user.display_name }), {
      httpOnly: false,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
    });

    return clearState(response);

  } catch (err: any) {
    console.error('OAuth callback error:', err.message);
    return clearState(NextResponse.redirect(`${BASE_URL}/?login=failed`));
  }
}