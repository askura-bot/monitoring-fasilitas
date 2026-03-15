// lib/overpass.ts
import { Facility, OSMTag } from './types';

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

interface CategoryQuery {
  id: string;
  name: string;
  osmTags: OSMTag[];
  // Jika true, query way juga (untuk fasilitas besar seperti bandara, stasiun)
  includeWay?: boolean;
}

async function queryOverpass(query: string): Promise<any> {
  const body = `data=${encodeURIComponent(query)}`;
  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      const response = await fetch(endpoint, { method: 'POST', body, headers, signal: controller.signal });
      clearTimeout(timeoutId);
      if (response.ok) return await response.json();
    } catch {
      // silent, coba endpoint berikutnya
    }
  }

  throw new Error('All Overpass API endpoints failed or timed out.');
}

export async function fetchMultipleCategoryFacilities(
  lat: number,
  lon: number,
  radius: number,
  categories: CategoryQuery[]
): Promise<Facility[]> {
  const radiusMeters = radius * 1000;
  const tagQueryLines: string[] = [];

  for (const category of categories) {
    for (const tag of category.osmTags) {
      // Selalu query node
      tagQueryLines.push(
        `node["${tag.key}"="${tag.value}"](around:${radiusMeters},${lat},${lon});`
      );
      // Query way hanya untuk kategori yang includeWay = true
      if (category.includeWay) {
        tagQueryLines.push(
          `way["${tag.key}"="${tag.value}"](around:${radiusMeters},${lat},${lon});`
        );
      }
    }
  }

  // Gunakan "out center" agar way punya koordinat (titik tengah area)
  const query = `[out:json][timeout:25];
(
  ${tagQueryLines.join('\n  ')}
);
out center 100;`;

  try {
    const data = await queryOverpass(query);
    const facilities: Facility[] = [];

    for (const element of data.elements) {
      // node → lat/lon langsung | way → ambil dari center
      const elLat = element.lat ?? element.center?.lat;
      const elLon = element.lon ?? element.center?.lon;

      if (elLat == null || elLon == null) continue;
      if (!element.tags) continue;

      const matchedCategory = findMatchingCategory(element.tags, categories);
      if (!matchedCategory) continue;

      const tags = element.tags;
      const addressParts = [
        tags['addr:street'],
        tags['addr:housenumber'],
        tags['addr:suburb'],
        tags['addr:city'],
      ].filter(Boolean);

      facilities.push({
        id: `${matchedCategory.id}-${element.id}`,
        name: tags.name || `Unnamed ${matchedCategory.name}`,
        category: matchedCategory.name,
        categoryId: matchedCategory.id,
        lat: elLat,
        lon: elLon,
        address: tags['addr:full'] || (addressParts.length > 0 ? addressParts.join(', ') : ''),
        type: tags.type || '',
        phone: tags.phone || tags['contact:phone'] || '',
        openingHours: tags.opening_hours || '',
        website: tags.website || tags['contact:website'] || '',
        operator: tags.operator || '',
      });
    }

    return facilities;
  } catch (error) {
    console.error('Error fetching from Overpass API:', error);
    return [];
  }
}

function findMatchingCategory(
  tags: Record<string, string>,
  categories: CategoryQuery[]
): CategoryQuery | null {
  for (const category of categories) {
    for (const osmTag of category.osmTags) {
      if (tags[osmTag.key] === osmTag.value) return category;
    }
  }
  return null;
}

export async function fetchFacilities(
  lat: number,
  lon: number,
  radius: number,
  osmTags: OSMTag[],
  categoryId: string,
  categoryName: string
): Promise<Facility[]> {
  return fetchMultipleCategoryFacilities(lat, lon, radius, [
    { id: categoryId, name: categoryName, osmTags },
  ]);
}