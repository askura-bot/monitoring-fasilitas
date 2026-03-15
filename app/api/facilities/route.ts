// app/api/facilities/route.ts
// Handle UPDATE dan DELETE fasilitas custom dari Supabase

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Cek apakah user sudah login OSM (ada cookie token)
function isLoggedIn(request: NextRequest): boolean {
  return !!request.cookies.get('osm_access_token')?.value;
}

// PUT — update fasilitas
export async function PUT(request: NextRequest) {
  if (!isLoggedIn(request)) {
    return NextResponse.json({ error: 'Login OSM diperlukan' }, { status: 401 });
  }

  try {
    const { id, ...updateData } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 });

    const { error } = await supabase
      .from('custom_facilities')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE — hapus fasilitas
export async function DELETE(request: NextRequest) {
  if (!isLoggedIn(request)) {
    return NextResponse.json({ error: 'Login OSM diperlukan' }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 });

    const { error } = await supabase
      .from('custom_facilities')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}