export interface Facility {
  id: string;
  name: string;
  category: string;
  categoryId?: string;
  lat: number;
  lon: number;
  address?: string;
  type?: string;
  phone?: string;
  openingHours?: string;
  website?: string;
  operator?: string;
  // Penanda asal data
  source?: 'osm' | 'custom';
  notInOsm?: boolean;
  note?: string;
}

export interface Category {
  includeWay?: boolean;
  id: string;
  name: string;
  icon: string;
  osmTags: OSMTag[];
  color: string;
}

export interface OSMTag {
  key: string;
  value: string;
}

export interface UserLocation {
  lat: number;
  lon: number;
}

export interface MapState {
  center: [number, number];
  zoom: number;
  radius: number;
}

export interface CustomFacilityInput {
  name: string;
  category: string;
  category_id: string;
  lat: number;
  lon: number;
  address: string;
  phone: string;
  opening_hours: string;
  website: string;
  operator: string;
  not_in_osm: boolean;
  note: string;
}