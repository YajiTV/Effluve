'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/');
        router.refresh();
      }}
      className="flex items-center gap-3 px-4 py-3 font-body text-sm text-red-600 hover:bg-red-50 rounded transition-colors w-full text-left mt-6"
      type="button"
    >
      <LogOut className="w-5 h-5" strokeWidth={1.5} />
      Se déconnecter
    </button>
  );
}
