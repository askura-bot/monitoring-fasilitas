// components/ui/AddFacilityForm.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CATEGORIES } from '@/lib/constants';
import { CustomFacilityInput } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, MapPin, Loader2 } from 'lucide-react';

interface AddFacilityFormProps {
  // Koordinat dari klik peta (opsional)
  prefilledLat?: number;
  prefilledLon?: number;
  onSuccess: () => void;
  onCancel: () => void;
  // Fasilitas yang sedang diedit (opsional, null = mode tambah)
  editingFacility?: any | null;
}

const emptyForm: CustomFacilityInput = {
  name: '',
  category: CATEGORIES[0].name,
  category_id: CATEGORIES[0].id,
  lat: 0,
  lon: 0,
  address: '',
  phone: '',
  opening_hours: '',
  website: '',
  operator: '',
  not_in_osm: true,
  note: '',
};

export default function AddFacilityForm({
  prefilledLat,
  prefilledLon,
  onSuccess,
  onCancel,
  editingFacility = null,
}: AddFacilityFormProps) {
  const isEditing = !!editingFacility;

  const [form, setForm] = useState<CustomFacilityInput>(
    isEditing
      ? {
          name: editingFacility.name,
          category: editingFacility.category,
          category_id: editingFacility.category_id,
          lat: editingFacility.lat,
          lon: editingFacility.lon,
          address: editingFacility.address || '',
          phone: editingFacility.phone || '',
          opening_hours: editingFacility.opening_hours || '',
          website: editingFacility.website || '',
          operator: editingFacility.operator || '',
          not_in_osm: editingFacility.not_in_osm ?? true,
          note: editingFacility.note || '',
        }
      : {
          ...emptyForm,
          lat: prefilledLat ?? 0,
          lon: prefilledLon ?? 0,
        }
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof CustomFacilityInput, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleCategoryChange = (categoryId: string) => {
    const cat = CATEGORIES.find((c) => c.id === categoryId);
    if (cat) {
      set('category_id', cat.id);
      set('category', cat.name);
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return setError('Nama fasilitas wajib diisi.');
    if (!form.lat || !form.lon) return setError('Koordinat wajib diisi. Klik peta atau isi manual.');

    setIsLoading(true);
    setError(null);

    try {
      if (isEditing) {
        const { error: err } = await supabase
          .from('custom_facilities')
          .update({ ...form, updated_at: new Date().toISOString() })
          .eq('id', editingFacility.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase
          .from('custom_facilities')
          .insert([form]);
        if (err) throw err;
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan data.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold text-sm">
          {isEditing ? 'Edit Fasilitas' : 'Tambah Fasilitas'}
        </h2>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
            {error}
          </div>
        )}

        {/* Nama */}
        <div className="space-y-1">
          <Label className="text-xs">Nama Fasilitas *</Label>
          <Input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="contoh: RS Umum Daerah Kota"
            className="h-8 text-sm"
          />
        </div>

        {/* Kategori */}
        <div className="space-y-1">
          <Label className="text-xs">Kategori *</Label>
          <select
            value={form.category_id}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full h-8 text-sm rounded-md border border-input bg-background px-3"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Koordinat */}
        <div className="space-y-1">
          <Label className="text-xs flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Koordinat *
            {prefilledLat && !isEditing && (
              <span className="text-green-600 font-normal ml-1">
                (dari klik peta ✓)
              </span>
            )}
          </Label>
          <div className="flex gap-2">
            <Input
              type="number"
              step="any"
              value={form.lat || ''}
              onChange={(e) => set('lat', parseFloat(e.target.value))}
              placeholder="Latitude"
              className="h-8 text-sm"
            />
            <Input
              type="number"
              step="any"
              value={form.lon || ''}
              onChange={(e) => set('lon', parseFloat(e.target.value))}
              placeholder="Longitude"
              className="h-8 text-sm"
            />
          </div>
          <p className="text-xs text-gray-400">
            Atau aktifkan mode "Pilih di Peta" lalu klik lokasi di peta
          </p>
        </div>

        {/* Alamat */}
        <div className="space-y-1">
          <Label className="text-xs">Alamat</Label>
          <Input
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
            placeholder="contoh: Jl. Pemuda No. 1"
            className="h-8 text-sm"
          />
        </div>

        {/* Operator */}
        <div className="space-y-1">
          <Label className="text-xs">Operator / Pengelola</Label>
          <Input
            value={form.operator}
            onChange={(e) => set('operator', e.target.value)}
            placeholder="contoh: Pemerintah Kota Semarang"
            className="h-8 text-sm"
          />
        </div>

        {/* Telepon */}
        <div className="space-y-1">
          <Label className="text-xs">Nomor Telepon</Label>
          <Input
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="contoh: +62 24 1234567"
            className="h-8 text-sm"
          />
        </div>

        {/* Jam buka */}
        <div className="space-y-1">
          <Label className="text-xs">Jam Buka</Label>
          <Input
            value={form.opening_hours}
            onChange={(e) => set('opening_hours', e.target.value)}
            placeholder="contoh: 24/7 atau Mo-Fr 08:00-17:00"
            className="h-8 text-sm"
          />
        </div>

        {/* Website */}
        <div className="space-y-1">
          <Label className="text-xs">Website</Label>
          <Input
            value={form.website}
            onChange={(e) => set('website', e.target.value)}
            placeholder="contoh: https://rsuddaerah.go.id"
            className="h-8 text-sm"
          />
        </div>

        {/* Belum ada di OSM */}
        <div className="flex items-start gap-2 pt-1">
          <input
            type="checkbox"
            id="not_in_osm"
            checked={form.not_in_osm}
            onChange={(e) => set('not_in_osm', e.target.checked)}
            className="mt-0.5"
          />
          <div>
            <Label htmlFor="not_in_osm" className="text-xs cursor-pointer">
              Tandai sebagai "Belum ada di OSM"
            </Label>
            <p className="text-xs text-gray-400 mt-0.5">
              Akan tampil badge khusus di popup peta
            </p>
          </div>
        </div>

        {/* Catatan */}
        <div className="space-y-1">
          <Label className="text-xs">Catatan</Label>
          <Input
            value={form.note}
            onChange={(e) => set('note', e.target.value)}
            placeholder="catatan tambahan (opsional)"
            className="h-8 text-sm"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t flex gap-2">
        <Button variant="outline" onClick={onCancel} className="flex-1 h-8 text-sm">
          Batal
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading} className="flex-1 h-8 text-sm">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isEditing ? (
            'Simpan Perubahan'
          ) : (
            'Tambah Fasilitas'
          )}
        </Button>
      </div>
    </div>
  );
}