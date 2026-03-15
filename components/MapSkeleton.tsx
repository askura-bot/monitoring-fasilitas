// components/ui/MapSkeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';

export default function MapSkeleton() {
  return (
    <div className="h-full w-full bg-gray-100 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Skeleton className="h-12 w-12 rounded-full mx-auto" />
        <Skeleton className="h-4 w-32 mx-auto" />
        <Skeleton className="h-3 w-48 mx-auto" />
      </div>
    </div>
  );
}
