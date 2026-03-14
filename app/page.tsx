'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Facility, UserLocation } from '@/lib/types';
import { CATEGORIES, DEFAULT_CENTER, DEFAULT_ZOOM, DEFAULT_RADIUS } from '@/lib/constants';
import { fetchMultipleCategoryFacilities } from '@/lib/overpass';
import Sidebar from '@/components/Sidebar';
import MapSkeleton from '@/components/MapSkeleton';
import { Button } from '@/components/ui/button';
import { Menu, Loader as Loader2, CircleAlert as AlertCircle } from 'lucide-react';
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
    CATEGORIES.map((cat) => cat.id)
  );
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

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
          setError(null);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError(
            'Unable to get your location. Using default location. Please enable location access.'
          );
          setIsGettingLocation(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
      setIsGettingLocation(false);
    }
  }, []);

// Initial load saat lokasi pertama kali didapat
useEffect(() => {
  if (userLocation && !hasInitialLoad) {
    fetchFacilitiesData();
    setHasInitialLoad(true);
  }
}, [userLocation]); // intentionally simple

// Auto-search saat radius berubah (dengan debounce)
useEffect(() => {
  if (!hasInitialLoad) return;
  const timer = setTimeout(() => {
    fetchFacilitiesData();
  }, 500); // debounce 500ms
  return () => clearTimeout(timer);
}, [radius]);

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

      const fetchedFacilities = await fetchMultipleCategoryFacilities(
        userLocation.lat,
        userLocation.lon,
        radius,
        categoriesToFetch
      );

      setFacilities(fetchedFacilities);
    } catch (err) {
      console.error('Error fetching facilities:', err);
      setError('Failed to fetch facilities. Please try again.');
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

  const handleRadiusChange = useCallback((newRadius: number) => {
    setRadius(newRadius);
  }, []);

  const handleRefresh = useCallback(() => {
    fetchFacilitiesData();
  }, [fetchFacilitiesData]);

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
      />

      <div className="flex-1 relative">
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
            className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] max-w-md mx-auto"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isGettingLocation ? (
          <div className="h-full w-full flex items-center justify-center bg-gray-50">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
              <p className="text-gray-600 font-medium">Getting your location...</p>
              <p className="text-sm text-gray-500">
                Please allow location access when prompted
              </p>
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

        {isLoading && !isGettingLocation && (
          <div className="absolute bottom-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-4 flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-sm font-medium">Searching facilities...</span>
          </div>
        )}
      </div>
    </div>
  );
}
