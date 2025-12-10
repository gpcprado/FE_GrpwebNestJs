'use client';

import { useRouter } from 'next/navigation';
import { getToken, logoutUser } from '@/lib/auth';

export default function DashboardLayout({ children }: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const token = getToken();

  if (!token) {
    router.push('/');
    return null;
  }

  function handleLogout() {
    logoutUser();
    router.push('/');
  }

  return (
    <div className="p-6 bg-gray=100">
      {children}
    </div>
  );
}
