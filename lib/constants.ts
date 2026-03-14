import { Category } from './types';

export const CATEGORIES: Category[] = [
  {
    id: 'police',
    name: 'Police Stations',
    icon: 'shield',
    color: '#3b82f6',
    osmTags: [{ key: 'amenity', value: 'police' }],
  },
  {
    id: 'hospital',
    name: 'Hospitals',
    icon: 'hospital',
    color: '#ef4444',
    osmTags: [
      { key: 'amenity', value: 'hospital' },
      { key: 'amenity', value: 'clinic' },
    ],
  },
  {
    id: 'station',
    name: 'Stations',
    icon: 'train',
    color: '#8b5cf6',
    osmTags: [
      { key: 'railway', value: 'station' },
      { key: 'railway', value: 'halt' },
    ],
  },
  {
    id: 'terminal',
    name: 'Bus Terminals',
    icon: 'bus',
    color: '#f59e0b',
    osmTags: [
      { key: 'amenity', value: 'bus_station' },
      { key: 'highway', value: 'bus_stop' },
    ],
  },
  {
    id: 'airport',
    name: 'Airports',
    icon: 'plane',
    color: '#06b6d4',
    osmTags: [{ key: 'aeroway', value: 'aerodrome' }],
  },
  {
    id: 'fuel',
    name: 'Gas Stations',
    icon: 'fuel',
    color: '#10b981',
    osmTags: [{ key: 'amenity', value: 'fuel' }],
  },
  {
    id: 'tourist',
    name: 'Tourist Attractions',
    icon: 'camera',
    color: '#ec4899',
    osmTags: [
      { key: 'tourism', value: 'attraction' },
      { key: 'tourism', value: 'museum' },
      { key: 'tourism', value: 'viewpoint' },
    ],
  },
  {
    id: 'workshop',
    name: 'Workshops',
    icon: 'wrench',
    color: '#64748b',
    osmTags: [
      { key: 'shop', value: 'car_repair' },
      { key: 'amenity', value: 'vehicle_inspection' },
    ],
  },
];

export const DEFAULT_CENTER: [number, number] = [40.7128, -74.006];
export const DEFAULT_ZOOM = 13;
export const MIN_RADIUS = 1;
export const MAX_RADIUS = 20;
export const DEFAULT_RADIUS = 2; // Dikurangi dari 5 → 2 km agar query awal lebih ringan