'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
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
}

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

function createColoredIcon(color: string) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color:${color};width:24px;height:24px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24], iconAnchor: [12, 24], popupAnchor: [0, -28],
  });
}

function createCustomIcon(color: string) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color:white;width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid ${color};box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>`,
    iconSize: [26, 26], iconAnchor: [13, 26], popupAnchor: [0, -30],
  });
}

const userIcon = L.divIcon({
  className: 'user-marker',
  html: `<div style="background-color:#3b82f6;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(59,130,246,0.5);"></div>`,
  iconSize: [16, 16], iconAnchor: [8, 8],
});

function FacilityPopupContent({ facility: initialFacility, categoryColor }: {
  facility: Facility;
  categoryColor: string;
}) {
  const [facility, setFacility] = useState(initialFacility);
  const [showEditForm, setShowEditForm] = useState(false);
  const isCustom = facility.source === 'custom';

  const gmapsUrl = `https://www.google.com/maps?q=${facility.lat},${facility.lon}`;
  const gmapsDirectionUrl = `https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lon}`;

  if (showEditForm) {
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
      <div style={{
        backgroundColor: categoryColor,
        margin: '-13px -19px 10px -19px',
        padding: '10px 14px',
        borderRadius: '8px 8px 0 0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', flexWrap: 'wrap' }}>
          <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
            {facility.category}
          </p>
          {isCustom && (
            <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.25)', color: 'white', padding: '1px 6px', borderRadius: '10px', fontWeight: 600 }}>
              Data Lokal
            </span>
          )}
          {facility.notInOsm && (
            <span style={{ fontSize: '10px', background: '#f97316', color: 'white', padding: '1px 6px', borderRadius: '10px', fontWeight: 600 }}>
              Belum di OSM
            </span>
          )}
        </div>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'white', lineHeight: 1.3 }}>
          {facility.name}
        </h3>
      </div>

      {/* Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#374151' }}>
        {facility.address ? (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
            <span>📍</span><span style={{ lineHeight: 1.4 }}>{facility.address}</span>
          </div>
        ) : null}
        {facility.operator ? (
          <div style={{ display: 'flex', gap: '6px' }}><span>🏢</span><span>{facility.operator}</span></div>
        ) : null}
        {facility.phone ? (
          <div style={{ display: 'flex', gap: '6px' }}>
            <span>📞</span>
            <a href={`tel:${facility.phone}`} style={{ color: '#2563eb', textDecoration: 'none' }}>{facility.phone}</a>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '6px', color: '#9ca3af' }}>
            <span>📞</span><span style={{ fontStyle: 'italic' }}>Belum ada nomor</span>
          </div>
        )}
        {facility.openingHours ? (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
            <span>🕐</span><span style={{ lineHeight: 1.4 }}>{facility.openingHours}</span>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '6px', color: '#9ca3af' }}>
            <span>🕐</span><span style={{ fontStyle: 'italic' }}>Jam buka belum diisi</span>
          </div>
        )}
        {facility.website ? (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span>🌐</span>
            <a
              href={facility.website.startsWith('http') ? facility.website : `https://${facility.website}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#2563eb', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}
            >
              {facility.website.replace(/^https?:\/\//, '')}
            </a>
          </div>
        ) : null}
        {facility.note ? (
          <div style={{ display: 'flex', gap: '6px' }}>
            <span>📝</span><span style={{ color: '#6b7280', fontStyle: 'italic' }}>{facility.note}</span>
          </div>
        ) : null}
        <div style={{ fontSize: '11px', color: '#9ca3af', display: 'flex', gap: '6px' }}>
          <span>🗺️</span><span>{facility.lat.toFixed(5)}, {facility.lon.toFixed(5)}</span>
        </div>
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

      {/* Tombol Edit OSM — hanya untuk data dari OSM */}
      {!isCustom && (
        <button
          onClick={() => setShowEditForm(true)}
          style={{
            width: '100%', padding: '7px', borderRadius: '6px',
            border: '1px dashed #d1d5db', background: '#f9fafb',
            fontSize: '11px', color: '#6b7280', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
          }}
        >
          ✏️ Lengkapi data di OSM
        </button>
      )}
    </div>
  );
}

export default function FacilityMap({ center, zoom, facilities, userLocation, radius }: FacilityMapProps) {
  const facilityMarkers = useMemo(() => {
    return facilities.map((facility) => {
      const category = CATEGORIES.find(
        (cat) => cat.id === facility.categoryId || cat.name === facility.category
      );
      const categoryColor = category?.color ?? '#6b7280';
      const isCustom = facility.source === 'custom';
      const icon = category
        ? (isCustom ? createCustomIcon(categoryColor) : createColoredIcon(categoryColor))
        : undefined;

      return (
        <Marker key={facility.id} position={[facility.lat, facility.lon]} icon={icon}>
          <Popup minWidth={220} maxWidth={280}>
            <FacilityPopupContent facility={facility} categoryColor={categoryColor} />
          </Popup>
        </Marker>
      );
    });
  }, [facilities]);

  return (
    <MapContainer center={center} zoom={zoom} className="h-full w-full" zoomControl={true}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater center={center} />

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
          <Circle
            center={[userLocation.lat, userLocation.lon]}
            radius={radius * 1000}
            pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1, weight: 2 }}
          />
        </>
      )}

      {facilityMarkers}
    </MapContainer>
  );
}