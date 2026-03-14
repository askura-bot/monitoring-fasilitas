export interface Facility {
  id: string;
  name: string;
  category: string;
  categoryId?: string;
  lat: number;
  lon: number;
  address?: string;
  type?: string;
  // Data tambahan
  phone?: string;
  openingHours?: string;
  website?: string;
  operator?: string;
}

export interface Category {
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