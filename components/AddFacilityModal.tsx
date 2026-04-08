// components/ui/AddFacilityModal.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CATEGORIES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, MapPin, Loader2, CheckCircle } from 'lucide-react';

interface FacilityFormData {
  id?: string; // ada saat mode edit
  name: string;
  category_id: string;
  category: string;
  lat: number;
  lon: number;
  address: string;
  phone: string;
  opening_hours: string;
  operator: string;
  note: string;
  not_in_osm: boolean;
}

interface AddFacilityModalProps {
  prefilledLat?: number;
  prefilledLon?: number;
  editingData?: FacilityFormData | null; // null = mode tambah, ada data = mode edit
  onSuccess: () => void;
  onClose: () => void;
}

export default function AddFacilityModal({
  prefilledLat,
  prefilledLon,
  editingData = null,
  onSuccess,
  onClose,
}: AddFacilityModalProps) {
  const isEditing = !!editingData;

  const [form, setForm] = useState<FacilityFormData>(
    editingData ?? {
      name: '',
      category_id: CATEGORIES[0].id,
      category: CATEGORIES[0].name,
      lat: prefilledLat ?? 0,
      lon: prefilledLon ?? 0,
      address: '',
      phone: '',
      opening_hours: '',
      operator: '',
      note: '',
      not_in_osm: true,
    }
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const set = (field: string, value: any) =>
    setForm((p) => ({ ...p, [field]: value }));

  const handleCategoryChange = (categoryId: string) => {
    const cat = CATEGORIES.find((c) => c.id === categoryId);
    if (cat) { set('category_id', cat.id); set('category', cat.name); }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return setError('Nama fasilitas wajib diisi.');
    if (!form.lat || !form.lon) return setError('Koordinat wajib diisi.');

    setIsLoading(true);
    setError(null);

    try {
      if (isEditing && editingData?.id) {
        // Mode edit — pakai API route (PUT)
        const res = await fetch('/api/facilities', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal mengupdate data.');
      } else {
        // INI YANG DIUBAH: Mode tambah — sekarang pakai API route (POST) juga!
        const res = await fetch('/api/facilities', {
          method: 'POST', // Ganti jadi POST
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal menambah data.');
      }

      setIsSuccess(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan data.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
          <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-4" />
          <p className="font-bold text-lg text-gray-800">
            {isEditing ? 'Berhasil diperbarui!' : 'Berhasil ditambahkan!'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {isEditing ? 'Perubahan telah disimpan.' : 'Lokasi baru telah disimpan ke database.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <h2 className="font-bold text-base">
              {isEditing ? 'Edit Lokasi' : 'Tambah Lokasi Baru'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <Label className="text-xs font-medium">Nama Fasilitas *</Label>
            <Input value={form.name} onChange={(e) => set('name', e.target.value)}
              placeholder="contoh: Pos Pam Simpang Lima" className="h-9 text-sm" />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Kategori *</Label>
            <select value={form.category_id} onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full h-9 text-sm rounded-md border border-input bg-background px-3">
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Koordinat *
              {prefilledLat && !isEditing && (
                <span className="text-green-600 font-normal ml-1 text-[11px]">✓ dari klik peta</span>
              )}
            </Label>
            <div className="flex gap-2">
              <Input type="number" step="any" value={form.lat || ''} onChange={(e) => set('lat', parseFloat(e.target.value))}
                placeholder="Latitude" className="h-9 text-sm" />
              <Input type="number" step="any" value={form.lon || ''} onChange={(e) => set('lon', parseFloat(e.target.value))}
                placeholder="Longitude" className="h-9 text-sm" />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Alamat</Label>
            <Input value={form.address} onChange={(e) => set('address', e.target.value)}
              placeholder="contoh: Jl. Pemuda, Semarang" className="h-9 text-sm" />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Operator / Pengelola</Label>
            <Input value={form.operator} onChange={(e) => set('operator', e.target.value)}
              placeholder="contoh: Polrestabes Semarang" className="h-9 text-sm" />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Nomor Telepon</Label>
            <Input value={form.phone} onChange={(e) => set('phone', e.target.value)}
              placeholder="contoh: +62 24 1234567" className="h-9 text-sm" />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Jam Operasional</Label>
            <Input value={form.opening_hours} onChange={(e) => set('opening_hours', e.target.value)}
              placeholder="contoh: 24/7 atau 06:00-22:00" className="h-9 text-sm" />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Catatan</Label>
            <Input value={form.note} onChange={(e) => set('note', e.target.value)}
              placeholder="contoh: Aktif saat Operasi Ketupat" className="h-9 text-sm" />
          </div>

          <div className="flex items-start gap-2 pt-1">
            <input type="checkbox" id="not_in_osm" checked={form.not_in_osm}
              onChange={(e) => set('not_in_osm', e.target.checked)} className="mt-0.5 cursor-pointer" />
            <div>
              <Label htmlFor="not_in_osm" className="text-xs cursor-pointer">Tandai "Belum ada di OSM"</Label>
              <p className="text-[11px] text-gray-400 mt-0.5">Akan tampil badge khusus di popup peta</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1 h-9 text-sm">Batal</Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="flex-1 h-9 text-sm">
            {isLoading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : isEditing ? 'Simpan Perubahan' : 'Simpan Lokasi'
            }
          </Button>
        </div>
      </div>
    </div>
  );
}