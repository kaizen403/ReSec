'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to user's order (order 2 belongs to the logged-in user)
    router.push('/orders/2');
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto text-center">
        <div className="animate-pulse">
          <div className="text-2xl font-bold mb-4">Loading your orders...</div>
        </div>
      </div>
    </div>
  );
}
