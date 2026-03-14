'use client';

import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Facility, UserLocation } from '@/lib/types';
import { CATEGORIES } from '@/lib/constants';

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
    if (!prevCenter.current) {
      prevCenter.current = center;
      return;
    }
    map.panTo(center);
    prevCenter.current = center;
  }, [center, map]);

  return null;
}

function createColoredIcon(color: string) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -28],
  });
}

const userIcon = L.divIcon({
  className: 'user-marker',
  html: `<div style="
    background-color: #3b82f6;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5);
  "></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function FacilityPopup({ facility, categoryColor }: {
  facility: Facility;
  categoryColor: string;
}) {
  const gmapsUrl = `https://www.google.com/maps?q=${facility.lat},${facility.lon}`;
  const gmapsDirectionUrl = `https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lon}`;

  return (
    <div style={{ minWidth: '220px', maxWidth: '260px', fontFamily: 'sans-serif' }}>
      {/* Header dengan warna kategori */}
      <div style={{
        backgroundColor: categoryColor,
        margin: '-13px -19px 10px -19px',
        padding: '10px 14px',
        borderRadius: '8px 8px 0 0',
      }}>
        <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
          {facility.category}
        </p>
        <h3 style={{ margin: '2px 0 0', fontSize: '14px', fontWeight: 700, color: 'white', lineHeight: 1.3 }}>
          {facility.name}
        </h3>
      </div>

      {/* Info rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#374151' }}>

        {facility.address ? (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '13px', flexShrink: 0 }}>📍</span>
            <span style={{ lineHeight: 1.4 }}>{facility.address}</span>
          </div>
        ) : null}

        {facility.operator ? (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', flexShrink: 0 }}>🏢</span>
            <span>{facility.operator}</span>
          </div>
        ) : null}

        {facility.phone ? (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', flexShrink: 0 }}>📞</span>
            <a href={`tel:${facility.phone}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
              {facility.phone}
            </a>
          </div>
        ) : null}

        {facility.openingHours ? (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '13px', flexShrink: 0 }}>🕐</span>
            <span style={{ lineHeight: 1.4 }}>{facility.openingHours}</span>
          </div>
        ) : null}

        {facility.website ? (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', flexShrink: 0 }}>🌐</span>
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

        {/* Koordinat selalu tampil */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', color: '#9ca3af', fontSize: '11px' }}>
          <span style={{ fontSize: '11px', flexShrink: 0 }}>🗺️</span>
          <span>{facility.lat.toFixed(5)}, {facility.lon.toFixed(5)}</span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #e5e7eb', margin: '10px 0 8px' }} />

      {/* Buttons Google Maps */}
      <div style={{ display: 'flex', gap: '6px' }}>
        <a
          href={gmapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            padding: '7px 0',
            backgroundColor: '#f3f4f6',
            color: '#374151',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 600,
            textDecoration: 'none',
            border: '1px solid #e5e7eb',
          }}
        >
          📌 Lihat di Maps
        </a>
        <a
          href={gmapsDirectionUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            padding: '7px 0',
            backgroundColor: categoryColor,
            color: 'white',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          🧭 Rute ke Sini
        </a>
      </div>
    </div>
  );
}

export default function FacilityMap({
  center,
  zoom,
  facilities,
  userLocation,
  radius,
}: FacilityMapProps) {
  const facilityMarkers = useMemo(() => {
    return facilities.map((facility) => {
      const category = CATEGORIES.find(
        (cat) => cat.id === facility.categoryId || cat.name === facility.category
      );
      const icon = category ? createColoredIcon(category.color) : undefined;
      const categoryColor = category?.color ?? '#6b7280';

      return (
        <Marker
          key={facility.id}
          position={[facility.lat, facility.lon]}
          icon={icon}
        >
          <Popup minWidth={220} maxWidth={280}>
            <FacilityPopup facility={facility} categoryColor={categoryColor} />
          </Popup>
        </Marker>
      );
    });
  }, [facilities]);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-full w-full"
      zoomControl={true}
    >
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
            pathOptions={{
              color: '#3b82f6',
              fillColor: '#3b82f6',
              fillOpacity: 0.1,
              weight: 2,
            }}
          />
        </>
      )}

      {facilityMarkers}
    </MapContainer>
  );
}
