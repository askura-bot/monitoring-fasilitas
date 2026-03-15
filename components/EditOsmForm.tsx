// components/ui/EditOsmForm.tsx
'use client';

import { useState } from 'react';
import { Facility } from '@/lib/types';
import { X, Loader2, ExternalLink, CheckCircle, LogIn } from 'lucide-react';

interface EditOsmFormProps {
  facility: Facility;
  onClose: () => void;
  onSuccess: (updatedFacility: Facility) => void;
}

interface EditableFields {
  phone: string;
  opening_hours: string;
  website: string;
  operator: string;
  'addr:street': string;
  'addr:city': string;
  'addr:postcode': string;
  email: string;
  'contact:facebook': string;
  'contact:instagram': string;
}

const FIELD_CONFIG = [
  { label: '📞 Telepon', field: 'phone' as const, placeholder: '+62 24 7601234' },
  { label: '🕐 Jam Buka', field: 'opening_hours' as const, placeholder: '24/7 atau Mo-Fr 08:00-17:00' },
  { label: '🌐 Website', field: 'website' as const, placeholder: 'https://...' },
  { label: '🏢 Operator', field: 'operator' as const, placeholder: 'nama pengelola' },
  { label: '📍 Nama Jalan', field: 'addr:street' as const, placeholder: 'Jl. Raya Gunungpati' },
  { label: '🏙️ Kota', field: 'addr:city' as const, placeholder: 'Semarang' },
  { label: '📮 Kode Pos', field: 'addr:postcode' as const, placeholder: '50222' },
  { label: '✉️ Email', field: 'email' as const, placeholder: 'info@example.com' },
  { label: '📘 Facebook', field: 'contact:facebook' as const, placeholder: 'facebook.com/...' },
  { label: '📷 Instagram', field: 'contact:instagram' as const, placeholder: '@username' },
];

export default function EditOsmForm({ facility, onClose, onSuccess }: EditOsmFormProps) {
  const osmNodeId = facility.id.split('-').slice(1).join('-');

  const [fields, setFields] = useState<EditableFields>({
    phone: facility.phone || '',
    opening_hours: facility.openingHours || '',
    website: facility.website || '',
    operator: facility.operator || '',
    'addr:street': facility.address || '',
    'addr:city': '',
    'addr:postcode': '',
    email: '',
    'contact:facebook': '',
    'contact:instagram': '',
  });
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needLogin, setNeedLogin] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const set = (field: keyof EditableFields, value: string) =>
    setFields((p) => ({ ...p, [field]: value }));

  const handleSubmit = async () => {
    console.log('facility.id:', facility.id);
    console.log('osmNodeId:', osmNodeId);
    console.log('source:', facility.source);
    // Kumpulkan hanya field yang terisi
    const updatedTags: Record<string, string> = {};
    for (const [k, v] of Object.entries(fields)) {
      if (v.trim()) updatedTags[k] = v.trim();
    }
    if (Object.keys(updatedTags).length === 0) {
      setError('Isi minimal satu field sebelum menyimpan.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setNeedLogin(false);

    try {
      const res = await fetch('/api/osm/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeId: osmNodeId,
          updatedTags,
          comment: comment || `Melengkapi data ${facility.name}`,
        }),
      });

      const data = await res.json();

      if (res.status === 401 && data.needLogin) {
        setNeedLogin(true);
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan ke OSM');

      setIsSuccess(true);
      onSuccess({
        ...facility,
        phone: fields.phone || facility.phone,
        openingHours: fields.opening_hours || facility.openingHours,
        website: fields.website || facility.website,
        operator: fields.operator || facility.operator,
        address: fields['addr:street'] || facility.address,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // State: perlu login
  if (needLogin) {
    return (
      <div style={{ minWidth: '240px', fontFamily: 'sans-serif', textAlign: 'center', padding: '16px 8px' }}>
        <LogIn style={{ width: 32, height: 32, color: '#2563eb', margin: '0 auto 8px' }} />
        <p style={{ fontWeight: 700, fontSize: '13px', margin: '0 0 6px' }}>Login OSM diperlukan</p>
        <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 14px' }}>
          Untuk mengedit data, Anda perlu login dengan akun OpenStreetMap dev terlebih dahulu.
        </p>
        <a
          href="/api/auth/osm/login"
          style={{ display: 'inline-block', padding: '8px 20px', background: '#2563eb', color: 'white', borderRadius: '6px', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}
        >
          Login dengan OSM
        </a>
        <br />
        <button onClick={onClose} style={{ marginTop: '8px', fontSize: '11px', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
          Batal
        </button>
      </div>
    );
  }

  // State: sukses
  if (isSuccess) {
    return (
      <div style={{ minWidth: '240px', fontFamily: 'sans-serif', textAlign: 'center', padding: '16px 8px' }}>
        <CheckCircle style={{ width: 36, height: 36, color: '#10b981', margin: '0 auto 8px' }} />
        <p style={{ fontWeight: 700, fontSize: '13px', margin: '0 0 4px' }}>Berhasil disimpan!</p>
        <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 12px' }}>
          Data telah dikirim ke OpenStreetMap dev server.
        </p>
        <a
          href={`https://www.openstreetmap.org/node/${osmNodeId}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '11px', color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
        >
          Lihat di OSM dev <ExternalLink style={{ width: 10, height: 10 }} />
        </a>
        <br />
        <button onClick={onClose} style={{ marginTop: '10px', padding: '5px 16px', borderRadius: '6px', border: '1px solid #e5e7eb', background: 'white', fontSize: '12px', cursor: 'pointer' }}>
          Tutup
        </button>
      </div>
    );
  }

  // State: form
  return (
    <div style={{ minWidth: '250px', maxWidth: '290px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 700 }}>Lengkapi Data OSM</p>
          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#6b7280' }}>{facility.name}</p>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <X style={{ width: 14, height: 14, color: '#6b7280' }} />
        </button>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', padding: '7px', fontSize: '11px', color: '#dc2626', marginBottom: '8px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', maxHeight: '300px', overflowY: 'auto', paddingRight: '2px' }}>
        {FIELD_CONFIG.map(({ label, field, placeholder }) => (
          <div key={field}>
            <label style={{ fontSize: '11px', color: '#374151', display: 'block', marginBottom: '2px' }}>{label}</label>
            <input
              value={fields[field]}
              onChange={(e) => set(field, e.target.value)}
              placeholder={placeholder}
              style={{ width: '100%', fontSize: '12px', padding: '5px 8px', borderRadius: '5px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
            />
          </div>
        ))}
        <div>
          <label style={{ fontSize: '11px', color: '#374151', display: 'block', marginBottom: '2px' }}>💬 Keterangan perubahan</label>
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="contoh: Menambahkan nomor telepon"
            style={{ width: '100%', fontSize: '12px', padding: '5px 8px', borderRadius: '5px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '10px', paddingTop: '8px', display: 'flex', gap: '6px' }}>
        <button onClick={onClose} style={{ flex: 1, padding: '7px', borderRadius: '6px', border: '1px solid #e5e7eb', background: 'white', fontSize: '12px', cursor: 'pointer' }}>
          Batal
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          style={{ flex: 1, padding: '7px', borderRadius: '6px', border: 'none', background: '#2563eb', color: 'white', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
        >
          {isLoading ? <><Loader2 style={{ width: 12, height: 12 }} /> Menyimpan...</> : '💾 Simpan ke OSM'}
        </button>
      </div>
      <p style={{ fontSize: '10px', color: '#9ca3af', marginTop: '5px', textAlign: 'center' }}>
        Menggunakan OSM dev server
      </p>
    </div>
  );
}