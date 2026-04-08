// components/ui/FacilityMap.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Facility, UserLocation } from '@/lib/types';
import { CATEGORIES } from '@/lib/constants';
import EditOsmForm from '@/components/EditOsmForm';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface FacilityMapProps {
  center: [number, number];
  zoom: number;
  facilities: Facility[];
  userLocation: UserLocation | null;
  radius: number;
  isPickingLocation?: boolean;
  onLocationPicked?: (lat: number, lon: number) => void;
  // Callback saat edit/hapus dari popup
  onEditFacility?: (facility: Facility) => void;
  onDeleteFacility?: (facility: Facility) => void;
  isOsmLoggedIn?: boolean; // apakah user sudah login OSM
}

const CATEGORY_ICONS: Record<string, string> = {
  police: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>`,
  hospital: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H13V5a1 1 0 00-2 0v6H5a1 1 0 000 2h6v6a1 1 0 002 0v-6h6a1 1 0 000-2z"/>`,
  station: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2C8 2 5 3.5 5 7v10l3 3h8l3-3V7c0-3.5-3-5-7-5zm0 0v4M8 17h8M9 9h6M9 12h6"/><circle cx="9.5" cy="14.5" r="1" fill="currentColor"/><circle cx="14.5" cy="14.5" r="1" fill="currentColor"/>`,
  terminal: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 6v6m8-6v6M4 6h16a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 17v2m10-2v2"/><circle cx="8" cy="14" r="1" fill="currentColor"/><circle cx="16" cy="14" r="1" fill="currentColor"/>`,
  airport: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l-7-4 1-2 5 1V7l-3-2 1-2 3 1.5L15 3l1 2-3 2v7l5-1 1 2-7 4z"/>`,
  fuel: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6a2 2 0 012-2h8a2 2 0 012 2v12H3V6z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 8h2a2 2 0 012 2v4a1 1 0 001 1v0a1 1 0 001-1V9l-3-3"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 10h5"/>`,
  tourist: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><circle cx="12" cy="13" r="3" stroke="currentColor" stroke-width="2"/>`,
  workshop: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>`,
  worship: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4l2-4z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 22V14h8v8"/>`,
  pospam: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2a4 4 0 014 4v4H8V6a4 4 0 014-4z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h8v2a4 4 0 01-8 0v-2z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 14h12M8 17h8M10 20h4"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6l1.5 1.5M20 6l-1.5 1.5M12 1V0"/>`,
};

function createFacilityIcon(color: string, categoryId: string, isCustom = false) {
  const svgPath = CATEGORY_ICONS[categoryId] ?? CATEGORY_ICONS['tourist'];
  const pinSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
      <path d="M18 0C8 0 0 8 0 18c0 12 18 26 18 26S36 30 36 18C36 8 28 0 18 0z"
        fill="${isCustom ? 'white' : color}"
        stroke="${color}" stroke-width="${isCustom ? 2.5 : 0}"/>
      <svg x="8" y="6" width="20" height="20" viewBox="0 0 24 24"
        fill="none" stroke="${isCustom ? color : 'white'}"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${svgPath}
      </svg>
    </svg>`;
  return L.divIcon({
    className: 'custom-marker',
    html: pinSvg,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -44],
  });
}

const userIcon = L.divIcon({
  className: 'user-marker',
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill="#3b82f6" stroke="white" stroke-width="3"/>
    <circle cx="12" cy="12" r="4" fill="white"/>
  </svg>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  const prevCenter = useRef<[number, number] | null>(null);
  useEffect(() => {
    if (!prevCenter.current) { prevCenter.current = center; return; }
    map.panTo(center);
    prevCenter.current = center;
  }, [center, map]);
  return null;
}

function LocationPicker({ isActive, onPick }: { isActive: boolean; onPick: (lat: number, lon: number) => void }) {
  const map = useMap();
  useEffect(() => {
    map.getContainer().style.cursor = isActive ? 'crosshair' : '';
    return () => { map.getContainer().style.cursor = ''; };
  }, [isActive, map]);
  useMapEvents({ click(e) { if (isActive) onPick(e.latlng.lat, e.latlng.lng); } });
  return null;
}

function FacilityPopupContent({
  facility: initialFacility,
  categoryColor,
  isOsmLoggedIn,
  onEdit,
  onDelete,
}: {
  facility: Facility;
  categoryColor: string;
  isOsmLoggedIn: boolean;
  onEdit?: (f: Facility) => void;
  onDelete?: (f: Facility) => void;
}) {
  const [facility, setFacility] = useState(initialFacility);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isCustom = facility.source === 'custom';

  const gmapsUrl = `https://www.google.com/maps?q=${facility.lat},${facility.lon}`;
  const gmapsDirectionUrl = `https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lon}`;

  const handleDelete = async () => {
    if (!confirm(`Hapus "${facility.name}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setIsDeleting(true);
    try {
      // Ambil UUID dari id format "custom-<uuid>"
      const uuid = facility.id.replace('custom-', '');
      const res = await fetch('/api/facilities', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: uuid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (onDelete) onDelete(facility);
    } catch (err: any) {
      alert('Gagal menghapus: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (showEditForm && !isCustom) {
    return (
      <EditOsmForm
        facility={facility}
        onClose={() => setShowEditForm(false)}
        onSuccess={(updated) => { setFacility(updated); setShowEditForm(false); }}
      />
    );
  }

  return (
    <div style={{ minWidth: '220px', maxWidth: '260px', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div style={{ backgroundColor: categoryColor, margin: '-13px -19px 10px -19px', padding: '10px 14px', borderRadius: '8px 8px 0 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', flexWrap: 'wrap' }}>
          <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{facility.category}</p>
          {isCustom && <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.25)', color: 'white', padding: '1px 6px', borderRadius: '10px', fontWeight: 600 }}>Data Lokal</span>}
          {facility.notInOsm && <span style={{ fontSize: '10px', background: '#f97316', color: 'white', padding: '1px 6px', borderRadius: '10px', fontWeight: 600 }}>Belum di OSM</span>}
        </div>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'white', lineHeight: 1.3 }}>{facility.name}</h3>
      </div>

      {/* Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#374151' }}>
        {facility.address ? <div style={{ display: 'flex', gap: '6px' }}><span>📍</span><span style={{ lineHeight: 1.4 }}>{facility.address}</span></div> : null}
        {facility.operator ? <div style={{ display: 'flex', gap: '6px' }}><span>🏢</span><span>{facility.operator}</span></div> : null}
        {facility.phone
          ? <div style={{ display: 'flex', gap: '6px' }}><span>📞</span><a href={`tel:${facility.phone}`} style={{ color: '#2563eb', textDecoration: 'none' }}>{facility.phone}</a></div>
          : <div style={{ display: 'flex', gap: '6px', color: '#9ca3af' }}><span>📞</span><span style={{ fontStyle: 'italic' }}>Belum ada nomor</span></div>
        }
        {facility.openingHours
          ? <div style={{ display: 'flex', gap: '6px' }}><span>🕐</span><span style={{ lineHeight: 1.4 }}>{facility.openingHours}</span></div>
          : <div style={{ display: 'flex', gap: '6px', color: '#9ca3af' }}><span>🕐</span><span style={{ fontStyle: 'italic' }}>Jam buka belum diisi</span></div>
        }
        {facility.website ? <div style={{ display: 'flex', gap: '6px' }}><span>🌐</span><a href={facility.website.startsWith('http') ? facility.website : `https://${facility.website}`} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>{facility.website.replace(/^https?:\/\//, '')}</a></div> : null}
        {facility.note ? <div style={{ display: 'flex', gap: '6px' }}><span>📝</span><span style={{ color: '#6b7280', fontStyle: 'italic' }}>{facility.note}</span></div> : null}
        <div style={{ fontSize: '11px', color: '#9ca3af', display: 'flex', gap: '6px' }}><span>🗺️</span><span>{facility.lat.toFixed(5)}, {facility.lon.toFixed(5)}</span></div>
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', margin: '10px 0 8px' }} />

      {/* Tombol Google Maps */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
        <a href={gmapsUrl} target="_blank" rel="noopener noreferrer"
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '7px 0', backgroundColor: '#f3f4f6', color: '#374151', borderRadius: '6px', fontSize: '11px', fontWeight: 600, textDecoration: 'none', border: '1px solid #e5e7eb' }}>
          📌 Lihat di Maps
        </a>
        <a href={gmapsDirectionUrl} target="_blank" rel="noopener noreferrer"
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '7px 0', backgroundColor: categoryColor, color: 'white', borderRadius: '6px', fontSize: '11px', fontWeight: 600, textDecoration: 'none' }}>
          🧭 Rute ke Sini
        </a>
      </div>

      {/* Tombol aksi — hanya tampil saat login OSM */}
      {isOsmLoggedIn && isCustom && (
        <div style={{ display: 'flex', gap: '6px' }}>
          {/* Edit */}
          <button onClick={() => onEdit && onEdit(facility)}
            style={{ flex: 1, padding: '7px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#f9fafb', fontSize: '11px', color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
            ✏️ Edit
          </button>
          {/* Hapus */}
          <button onClick={handleDelete} disabled={isDeleting}
            style={{ flex: 1, padding: '7px', borderRadius: '6px', border: '1px solid #fca5a5', background: '#fef2f2', fontSize: '11px', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
            {isDeleting ? '⏳' : '🗑️'} {isDeleting ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      )}

      {/* Tombol lengkapi OSM — hanya untuk data OSM */}
      {isOsmLoggedIn && !isCustom && (
        <button onClick={() => setShowEditForm(true)}
          style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px dashed #d1d5db', background: '#f9fafb', fontSize: '11px', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          ✏️ Lengkapi data di OSM
        </button>
      )}
    </div>
  );
}

export default function FacilityMap({
  center, zoom, facilities, userLocation, radius,
  isPickingLocation = false, onLocationPicked,
  onEditFacility, onDeleteFacility, isOsmLoggedIn = false,
}: FacilityMapProps) {
  const facilityMarkers = useMemo(() => {
    return facilities.map((facility) => {
      const category = CATEGORIES.find((cat) => cat.id === facility.categoryId || cat.name === facility.category);
      const categoryColor = category?.color ?? '#6b7280';
      const categoryId = category?.id ?? 'tourist';
      const isCustom = facility.source === 'custom';
      const icon = createFacilityIcon(categoryColor, categoryId, isCustom);

      return (
        <Marker key={facility.id} position={[facility.lat, facility.lon]} icon={icon}>
          <Popup minWidth={220} maxWidth={280}>
            <FacilityPopupContent
              facility={facility}
              categoryColor={categoryColor}
              isOsmLoggedIn={isOsmLoggedIn}
              onEdit={onEditFacility}
              onDelete={onDeleteFacility}
            />
          </Popup>
        </Marker>
      );
    });
  }, [facilities, isOsmLoggedIn, onEditFacility, onDeleteFacility]);

  return (
    <MapContainer center={center} zoom={zoom} className="h-full w-full" zoomControl={true}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater center={center} />
      <LocationPicker isActive={isPickingLocation} onPick={onLocationPicked ?? (() => {})} />

      {isPickingLocation && (
        <div className="leaflet-top leaflet-left" style={{ pointerEvents: 'none' }}>
          <div style={{ margin: '10px 0 0 10px', background: '#1d4ed8', color: 'white', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
            🎯 Klik lokasi di peta untuk menandai posisi
          </div>
        </div>
      )}

      {userLocation && (
        <>
          <Marker position={[userLocation.lat, userLocation.lon]} icon={userIcon}>
            <Popup>
              <div style={{ padding: '4px', fontFamily: 'sans-serif' }}>
                <p style={{ fontWeight: 700, margin: 0, fontSize: '13px' }}>📍 Lokasi Anda</p>
                <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#6b7280' }}>
                  {userLocation.lat.toFixed(5)}, {userLocation.lon.toFixed(5)}
                </p>
              </div>
            </Popup>
          </Marker>
          <Circle center={[userLocation.lat, userLocation.lon]} radius={radius * 1000}
            pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1, weight: 2 }} />
        </>
      )}

      {facilityMarkers}
    </MapContainer>
  );
}