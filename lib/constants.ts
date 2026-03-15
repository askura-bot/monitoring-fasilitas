import { Category } from './types';

export const CATEGORIES: Category[] = [
  {
    id: 'police',
    name: 'Kantor Polisi',
    icon: 'shield',
    color: '#3b82f6',
    osmTags: [{ key: 'amenity', value: 'police' }],
  },
  {
    id: 'hospital',
    name: 'Rumah Sakit',
    icon: 'hospital',
    color: '#ef4444',
    osmTags: [
      { key: 'amenity', value: 'hospital' },
      { key: 'amenity', value: 'clinic' },
    ],
    includeWay: true,
  },
  {
    id: 'station',
    name: 'Stasiun',
    icon: 'train',
    color: '#8b5cf6',
    osmTags: [
      { key: 'railway', value: 'station' },
      { key: 'railway', value: 'halt' },
    ],
    includeWay: true,
  },
  {
    id: 'terminal',
    name: 'Terminal Bus',
    icon: 'bus',
    color: '#f59e0b',
    osmTags: [
      { key: 'amenity', value: 'bus_station' },
      { key: 'highway', value: 'bus_stop' },
    ],
    includeWay: true,
  },
  {
    id: 'airport',
    name: 'Bandara',
    icon: 'plane',
    color: '#06b6d4',
    osmTags: [{ key: 'aeroway', value: 'aerodrome' }],
    includeWay: true,
  },
  {
    id: 'fuel',
    name: 'Pom Bensin',
    icon: 'fuel',
    color: '#10b981',
    osmTags: [{ key: 'amenity', value: 'fuel' }],
  },
  {
    id: 'tourist',
    name: 'Objek Wisata',
    icon: 'camera',
    color: '#ec4899',
    osmTags: [
      { key: 'tourism', value: 'attraction' },
      { key: 'tourism', value: 'museum' },
      { key: 'tourism', value: 'viewpoint' },
    ],
    includeWay: true,
  },
  {
    id: 'workshop',
    name: 'Bengkel',
    icon: 'wrench',
    color: '#64748b',
    osmTags: [
      { key: 'shop', value: 'car_repair' },
      { key: 'amenity', value: 'vehicle_inspection' },
    ],
    includeWay: true,
  },
  {
    id: 'worship',
    name: 'Tempat Ibadah',
    icon: 'landmark',
    color: '#0ea5e9',
    osmTags: [{ key: 'amenity', value: 'place_of_worship' }],
    includeWay: true,
  },
  {
    // Pos Pam = Pos Pengamanan sementara kepolisian (Operasi Ketupat, dll)
    // Di OSM biasanya ditag sebagai amenity=police dengan nama mengandung "Pos Pam"
    // atau highway=rest_area dengan nama Pos Pam
    // Karena sifatnya sementara, banyak yang belum ada di OSM
    // sehingga data utamanya dari Supabase (custom)
    id: 'pospam',
    name: 'Pos Pengamanan',
    icon: 'siren',
    color: '#dc2626',
    osmTags: [
      { key: 'amenity', value: 'police' },
      { key: 'highway', value: 'rest_area' },
    ],
  },
];

export const DEFAULT_CENTER: [number, number] = [-7.0051, 110.4381]; // Semarang
export const DEFAULT_ZOOM = 13;
export const MIN_RADIUS = 1;
export const MAX_RADIUS = 20;
export const DEFAULT_RADIUS = 2;

export const DEFAULT_SELECTED_CATEGORIES: string[] = [];