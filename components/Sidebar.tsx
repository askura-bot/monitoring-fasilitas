'use client';

import { CATEGORIES, MIN_RADIUS, MAX_RADIUS } from '@/lib/constants';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Shield, Hospital, Brain as Train, Bus, Plane,
  Fuel, Camera, Wrench, Landmark, Siren, MapPin, X, Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import OsmLoginButton from '@/components/OsmLoginButton';

interface SidebarProps {
  selectedCategories: string[];
  onCategoryToggle: (categoryId: string) => void;
  radius: number;
  onRadiusChange: (radius: number) => void;
  facilityCount: number;
  isLoading: boolean;
  onRefresh: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  hasSearched: boolean;
  onAddLocation: () => void; // ← prop baru untuk tambah lokasi
}

const iconMap: Record<string, any> = {
  shield: Shield,
  hospital: Hospital,
  train: Train,
  bus: Bus,
  plane: Plane,
  fuel: Fuel,
  camera: Camera,
  wrench: Wrench,
  landmark: Landmark,
  siren: Siren,  // ← icon Pos Pam
};

export default function Sidebar({
  selectedCategories,
  onCategoryToggle,
  radius,
  onRadiusChange,
  facilityCount,
  isLoading,
  onRefresh,
  isMobileOpen,
  onMobileClose,
  hasSearched,
  onAddLocation,
}: SidebarProps) {
  const noneSelected = selectedCategories.length === 0;

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity',
          isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onMobileClose}
      />

      <div
        className={cn(
          'fixed lg:relative top-0 left-0 h-full w-80 bg-white shadow-lg z-50 flex flex-col transition-transform duration-300',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="border-b">
          <div className="flex items-center justify-between p-4 pb-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <h1 className="text-xl font-bold">Facility Monitor</h1>
            </div>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMobileClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          {/* Login OSM + tombol tambah lokasi */}
          <div className="px-4 pb-3">
            <OsmLoginButton onAddLocation={onAddLocation} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Radius */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700">Search Radius</h2>
              <Badge variant="secondary">{radius} km</Badge>
            </div>
            <Slider
              value={[radius]}
              onValueChange={(value) => onRadiusChange(value[0])}
              min={MIN_RADIUS}
              max={MAX_RADIUS}
              step={0.5}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{MIN_RADIUS} km</span>
              <span>{MAX_RADIUS} km</span>
            </div>
          </div>

          {/* Kategori */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700">Categories</h2>
              <Badge variant={noneSelected ? 'destructive' : 'outline'}>
                {noneSelected ? 'Belum dipilih' : `${selectedCategories.length} dipilih`}
              </Badge>
            </div>

            {noneSelected && (
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700 leading-relaxed">
                  Pilih minimal satu kategori lalu klik <strong>"Cari Fasilitas"</strong> untuk mulai pencarian.
                </p>
              </div>
            )}

            <div className="space-y-2">
              {CATEGORIES.map((category) => {
                const Icon = iconMap[category.icon];
                const isSelected = selectedCategories.includes(category.id);
                return (
                  <button
                    key={category.id}
                    onClick={() => onCategoryToggle(category.id)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all hover:shadow-md',
                      isSelected ? 'border-current shadow-sm' : 'border-gray-200 hover:border-gray-300'
                    )}
                    style={{
                      color: isSelected ? category.color : undefined,
                      backgroundColor: isSelected ? `${category.color}10` : 'white',
                    }}
                  >
                    <div className="p-2 rounded-md" style={{ backgroundColor: `${category.color}20` }}>
                      <Icon className="h-5 w-5" style={{ color: category.color }} />
                    </div>
                    <span className="flex-1 text-left text-sm font-medium text-gray-700">
                      {category.name}
                    </span>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: category.color }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tombol search */}
          <div className="pt-4 border-t space-y-2">
            <Button
              onClick={onRefresh}
              disabled={isLoading || noneSelected}
              className="w-full flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              {isLoading ? 'Mencari...' : noneSelected ? 'Pilih Kategori Dulu' : 'Cari Fasilitas'}
            </Button>

            {hasSearched && !isLoading && (
              <p className="text-xs text-center text-gray-500">
                {facilityCount > 0 ? `${facilityCount} fasilitas ditemukan` : 'Tidak ada fasilitas ditemukan'}
              </p>
            )}
            {!hasSearched && !noneSelected && (
              <p className="text-xs text-center text-blue-500">
                Klik "Cari Fasilitas" untuk mulai pencarian
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}