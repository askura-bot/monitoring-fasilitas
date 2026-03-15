// components/ui/AdminPanel.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CATEGORIES } from '@/lib/constants';
import AddFacilityForm from '@/components/AddFacilityForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, X, MapPin, Loader2, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminPanelProps {
  // Koordinat dari klik peta (mode pilih lokasi)
  pendingCoords: { lat: number; lon: number } | null;
  onClearPendingCoords: () => void;
  // Callback untuk refresh fasilitas di peta
  onFacilitiesChanged: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export default function AdminPanel({
  pendingCoords,
  onClearPendingCoords,
  onFacilitiesChanged,
  isMobileOpen,
  onMobileClose,
}: AdminPanelProps) {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingFacility, setEditingFacility] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Buka form otomatis jika ada koordinat dari klik peta
  useEffect(() => {
    if (pendingCoords) {
      setEditingFacility(null);
      setView('form');
    }
  }, [pendingCoords]);

  const fetchFacilities = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('custom_facilities')
      .select('*')
      .order('created_at', { ascending: false });
    setFacilities(data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus fasilitas ini?')) return;
    setDeletingId(id);
    await supabase.from('custom_facilities').delete().eq('id', id);
    setDeletingId(null);
    fetchFacilities();
    onFacilitiesChanged();
  };

  const handleFormSuccess = () => {
    setView('list');
    setEditingFacility(null);
    onClearPendingCoords();
    fetchFacilities();
    onFacilitiesChanged();
  };

  const handleFormCancel = () => {
    setView('list');
    setEditingFacility(null);
    onClearPendingCoords();
  };

  const getCategoryColor = (categoryId: string) => {
    return CATEGORIES.find((c) => c.id === categoryId)?.color ?? '#6b7280';
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity',
          isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onMobileClose}
      />

      <div
        className={cn(
          'fixed lg:relative top-0 right-0 h-full w-80 bg-white shadow-lg z-50 flex flex-col transition-transform duration-300',
          isMobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-orange-500" />
            <h2 className="font-semibold text-sm">Admin — Data Lokal</h2>
          </div>
          <div className="flex items-center gap-1">
            {view === 'list' && (
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => { setEditingFacility(null); setView('form'); }}
                title="Tambah fasilitas"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-7 w-7"
              onClick={onMobileClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {view === 'form' ? (
          <AddFacilityForm
            prefilledLat={pendingCoords?.lat}
            prefilledLon={pendingCoords?.lon}
            editingFacility={editingFacility}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Banner pilih lokasi */}
            {pendingCoords && (
              <div className="m-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
                <p className="font-semibold flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Koordinat dipilih
                </p>
                <p className="mt-0.5">
                  {pendingCoords.lat.toFixed(5)}, {pendingCoords.lon.toFixed(5)}
                </p>
                <Button
                  size="sm"
                  className="mt-2 h-6 text-xs w-full"
                  onClick={() => setView('form')}
                >
                  Lanjut isi form →
                </Button>
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : facilities.length === 0 ? (
              <div className="text-center py-12 px-4">
                <MapPin className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Belum ada fasilitas custom</p>
                <p className="text-xs text-gray-400 mt-1">
                  Klik tombol + atau klik peta untuk menambahkan
                </p>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                <p className="text-xs text-gray-400 px-1">
                  {facilities.length} fasilitas tersimpan
                </p>
                {facilities.map((f) => (
                  <div
                    key={f.id}
                    className="border rounded-lg p-3 text-sm bg-white hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-medium text-xs truncate">{f.name}</span>
                          {f.not_in_osm && (
                            <Badge
                              variant="outline"
                              className="text-[10px] h-4 px-1 border-orange-300 text-orange-600"
                            >
                              Belum di OSM
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: getCategoryColor(f.category_id) }}
                          />
                          <span className="text-xs text-gray-500">{f.category}</span>
                        </div>
                        {f.address && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{f.address}</p>
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => { setEditingFacility(f); setView('form'); }}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(f.id)}
                          disabled={deletingId === f.id}
                        >
                          {deletingId === f.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}