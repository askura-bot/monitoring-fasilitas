// components/ui/OsmLoginButton.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, User } from 'lucide-react';

interface OsmUser {
  id: number;
  name: string;
}

export default function OsmLoginButton() {
  const [user, setUser] = useState<OsmUser | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Baca cookie osm_user
    const cookie = document.cookie
      .split('; ')
      .find((c) => c.startsWith('osm_user='));
    if (cookie) {
      try {
        setUser(JSON.parse(decodeURIComponent(cookie.split('=')[1])));
      } catch {}
    }

    // Tampilkan notifikasi berdasarkan query param dari callback
    const login = searchParams.get('login');
    if (login === 'success') {
      setToast({ msg: 'Berhasil login OSM!', type: 'success' });
      router.replace('/'); // hapus query param dari URL
    } else if (login === 'cancelled') {
      setToast({ msg: 'Login dibatalkan.', type: 'info' });
      router.replace('/');
    } else if (login === 'failed') {
      setToast({ msg: 'Login gagal, coba lagi.', type: 'error' });
      router.replace('/');
    }
  }, [searchParams, router]);

  // Auto-hide toast setelah 3 detik
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const toastColors = {
    success: { bg: '#f0fdf4', border: '#86efac', text: '#166534' },
    error:   { bg: '#fef2f2', border: '#fca5a5', text: '#dc2626' },
    info:    { bg: '#eff6ff', border: '#93c5fd', text: '#1d4ed8' },
  };

  return (
    <div className="relative">
      {/* Toast notifikasi */}
      {toast && (
        <div style={{
          position: 'absolute', bottom: '110%', left: 0, right: 0,
          background: toastColors[toast.type].bg,
          border: `1px solid ${toastColors[toast.type].border}`,
          color: toastColors[toast.type].text,
          borderRadius: '6px', padding: '6px 10px',
          fontSize: '11px', fontWeight: 500, whiteSpace: 'nowrap',
          zIndex: 100,
        }}>
          {toast.msg}
        </div>
      )}

      {user ? (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <User className="h-3 w-3 text-green-600" />
            <span className="font-medium text-green-700">{user.name}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => { window.location.href = '/api/auth/osm/logout'; }}
          >
            <LogOut className="h-3 w-3 mr-1" />
            Logout
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs w-full"
          onClick={() => { window.location.href = '/api/auth/osm/login'; }}
        >
          <LogIn className="h-3 w-3 mr-1" />
          Login OSM
        </Button>
      )}
    </div>
  );
}