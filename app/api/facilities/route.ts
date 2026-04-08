// app/api/facilities/route.ts
// Handle POST, UPDATE dan DELETE fasilitas custom dari Supabase

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Pastikan variabel ini ada di .env.local
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

    // GANTI 'supabase' MENJADI 'supabaseAdmin' DI SINI
    const { error } = await supabaseAdmin
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

    // GANTI 'supabase' MENJADI 'supabaseAdmin' DI SINI
    const { error } = await supabaseAdmin
      .from('custom_facilities')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST — Tambah fasilitas baru
export async function POST(request: NextRequest) {
  // PENTING: Cek dulu apakah user sudah login!
  if (!isLoggedIn(request)) {
    return NextResponse.json({ error: 'Login OSM diperlukan untuk menambah lokasi' }, { status: 401 });
  }

  try {
    const data = await request.json();
    
    // Gunakan supabaseAdmin (Service Role) untuk melakukan insert
    // karena dia bisa bypass RLS.
    const { error } = await supabaseAdmin
      .from('custom_facilities')
      .insert([data]);

    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}