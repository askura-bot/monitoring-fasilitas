'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Facility, UserLocation } from '@/lib/types';
import {
  CATEGORIES,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  DEFAULT_RADIUS,
  DEFAULT_SELECTED_CATEGORIES,
} from '@/lib/constants';
import { fetchMultipleCategoryFacilities } from '@/lib/overpass';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import MapSkeleton from '@/components/MapSkeleton';
import { Button } from '@/components/ui/button';
import { Menu, Loader as Loader2, CircleAlert as AlertCircle, Layers } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const FacilityMap = dynamic(() => import('@/components/FacilityMap'), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

export default function Home() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [mapZoom] = useState(DEFAULT_ZOOM);
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    DEFAULT_SELECTED_CATEGORIES
  );
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Ambil lokasi user
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          setUserLocation(location);
          setMapCenter([location.lat, location.lon]);
          setIsGettingLocation(false);
        },
        () => {
          setError('Tidak dapat mengakses lokasi. Menggunakan lokasi default.');
          setIsGettingLocation(false);
        }
      );
    } else {
      setError('Geolocation tidak didukung browser ini.');
      setIsGettingLocation(false);
    }
  }, []);

  // Auto-search saat radius berubah — hanya jika sudah pernah search
  useEffect(() => {
    if (!hasSearched || selectedCategories.length === 0) return;
    const timer = setTimeout(() => { fetchFacilitiesData(); }, 500);
    return () => clearTimeout(timer);
  }, [radius]);

  // Auto-search saat kategori berubah — hanya jika sudah pernah search
  useEffect(() => {
    if (!hasSearched) return;
    if (selectedCategories.length === 0) { setFacilities([]); return; }
    fetchFacilitiesData();
  }, [selectedCategories]);

  const fetchFacilitiesData = useCallback(async () => {
    if (!userLocation || selectedCategories.length === 0) {
      setFacilities([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const categoriesToFetch = CATEGORIES.filter((cat) =>
        selectedCategories.includes(cat.id)
      );

      const [osmFacilities, supabaseResult] = await Promise.all([
        fetchMultipleCategoryFacilities(
          userLocation.lat,
          userLocation.lon,
          radius,
          categoriesToFetch
        ),
        supabase.from('custom_facilities').select('*'),
      ]);

      const taggedOsm: Facility[] = osmFacilities.map((f) => ({
        ...f,
        source: 'osm' as const,
      }));

      const customFacilities: Facility[] = (supabaseResult.data || [])
        .filter((f) => selectedCategories.includes(f.category_id))
        .map((f) => ({
          id: `custom-${f.id}`,
          name: f.name,
          category: f.category,
          categoryId: f.category_id,
          lat: f.lat,
          lon: f.lon,
          address: f.address || '',
          phone: f.phone || '',
          openingHours: f.opening_hours || '',
          website: f.website || '',
          operator: f.operator || '',
          note: f.note || '',
          source: 'custom' as const,
          notInOsm: f.not_in_osm,
        }));

      setFacilities([...customFacilities, ...taggedOsm]);
      setHasSearched(true);
    } catch (err) {
      console.error('Error fetching facilities:', err);
      setError('Gagal mengambil data fasilitas. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }, [userLocation, selectedCategories, radius]);

  const handleCategoryToggle = useCallback((categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  const handleRadiusChange = useCallback((newRadius: number) => setRadius(newRadius), []);
  const handleRefresh = useCallback(() => fetchFacilitiesData(), [fetchFacilitiesData]);

  const showSelectPrompt = !isGettingLocation && !hasSearched && selectedCategories.length === 0 && !isMobileSidebarOpen;
  const showEmptyResult = hasSearched && facilities.length === 0 && !isLoading && selectedCategories.length > 0;

  return (
    <div className="h-screen w-full flex overflow-hidden">
      <Sidebar
        selectedCategories={selectedCategories}
        onCategoryToggle={handleCategoryToggle}
        radius={radius}
        onRadiusChange={handleRadiusChange}
        facilityCount={facilities.length}
        isLoading={isLoading}
        onRefresh={handleRefresh}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        hasSearched={hasSearched}
      />

      <div className="flex-1 relative">
        {/* Tombol mobile sidebar */}
        <Button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="absolute top-4 left-4 z-[1000] lg:hidden shadow-lg"
          size="icon"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {error && (
          <Alert
            variant="destructive"
            className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] max-w-md"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isGettingLocation ? (
          <div className="h-full w-full flex items-center justify-center bg-gray-50">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
              <p className="text-gray-600 font-medium">Mendapatkan lokasi Anda...</p>
              <p className="text-sm text-gray-500">Izinkan akses lokasi saat diminta</p>
            </div>
          </div>
        ) : (
          <FacilityMap
            center={mapCenter}
            zoom={mapZoom}
            facilities={facilities}
            userLocation={userLocation}
            radius={radius}
          />
        )}

        {/* Banner: belum pilih kategori */}
        {showSelectPrompt && (
          <div className="absolute inset-0 flex items-center justify-center z-[500] pointer-events-none">
            <div className="bg-white rounded-2xl shadow-2xl p-6 mx-4 max-w-sm text-center pointer-events-auto border border-gray-100">
              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Layers className="h-7 w-7 text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-800 mb-2">
                Pilih Kategori Fasilitas
              </h2>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                Pilih satu atau lebih kategori di panel kiri, lalu klik{' '}
                <span className="font-semibold text-gray-700">"Cari Fasilitas"</span>{' '}
                untuk mencari fasilitas di sekitar lokasi Anda.
              </p>
              <Button
                size="sm"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden w-full"
              >
                Buka Pilihan Kategori
              </Button>
              <p className="text-xs text-gray-400 mt-2 hidden lg:block">
                Panel kategori tersedia di sebelah kiri
              </p>
            </div>
          </div>
        )}

        {/* Banner: hasil pencarian kosong */}
        {showEmptyResult && (
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-[1000]">
            <div className="bg-white rounded-lg shadow-lg px-5 py-3 flex items-center gap-3 border border-gray-100">
              <span className="text-xl">🔍</span>
              <p className="text-sm text-gray-600">
                Tidak ada fasilitas ditemukan di area ini.
              </p>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && !isGettingLocation && (
          <div className="absolute bottom-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-4 flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-sm font-medium">Mencari fasilitas...</span>
          </div>
        )}
      </div>
    </div>
  );
}