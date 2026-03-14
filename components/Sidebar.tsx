'use client';

import { Category } from '@/lib/types';
import { CATEGORIES, MIN_RADIUS, MAX_RADIUS } from '@/lib/constants';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Hospital, Train, Bus, Plane, Fuel, Camera, Wrench, Landmark, MapPin, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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
}: SidebarProps) {
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
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <h1 className="text-xl font-bold">Facility Monitor</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMobileClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
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

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700">Categories</h2>
              <Badge variant="outline">
                {selectedCategories.length} selected
              </Badge>
            </div>
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
                      isSelected
                        ? 'border-current shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                    style={{
                      color: isSelected ? category.color : undefined,
                      backgroundColor: isSelected
                        ? `${category.color}10`
                        : 'white',
                    }}
                  >
                    <div
                      className="p-2 rounded-md"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: category.color }} />
                    </div>
                    <span className="flex-1 text-left text-sm font-medium">
                      {category.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button
              onClick={onRefresh}
              disabled={isLoading || selectedCategories.length === 0}
              className="w-full"
            >
              {isLoading ? 'Searching...' : 'Search This Area'}
            </Button>
            <p className="text-xs text-center text-gray-500 mt-2">
              {facilityCount} facilities found
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
