import { Category } from './types';

export const CATEGORIES: Category[] = [
  {
    id: 'police',
    name: 'Police Stations',
    icon: 'shield',
    color: '#3b82f6',
    osmTags: [
      { key: 'amenity', value: 'police' }
    ],
    includeWay: true,
  },
  {
    id: 'hospital',
    name: 'Hospitals',
    icon: 'hospital',
    color: '#ef4444',
    osmTags: [
      { key: 'amenity', value: 'hospital' },
      // { key: 'amenity', value: 'clinic' },
    ],
    includeWay: true, // rumah sakit besar sering berupa area
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
    includeWay: true, // stasiun besar bisa berupa area
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
    includeWay: true, // terminal bus sering berupa area
  },
  {
    id: 'airport',
    name: 'Airports',
    icon: 'plane',
    color: '#06b6d4',
    osmTags: [{ key: 'aeroway', value: 'aerodrome' }],
    includeWay: true, // ← bandara SELALU berupa area (way), bukan node
  },
  {
    id: 'fuel',
    name: 'Gas Stations',
    icon: 'fuel',
    color: '#10b981',
    osmTags: [{ key: 'amenity', value: 'fuel' }],
    // SPBU biasanya node, tidak perlu includeWay
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
    includeWay: true, // objek wisata bisa berupa area
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
    includeWay: true,
  },
  {
    id: 'worship',
    name: 'Worship Place',
    icon: 'landmark',
    color: '#0ea5e9',
    osmTags: [{ key: 'amenity', value: 'place_of_worship' }],
    includeWay: true, // masjid/gereja besar sering berupa area
  },
];

export const DEFAULT_CENTER: [number, number] = [-7.0051, 110.4381]; // Semarang
export const DEFAULT_ZOOM = 13;
export const MIN_RADIUS = 1;
export const MAX_RADIUS = 20;
export const DEFAULT_RADIUS = 2;