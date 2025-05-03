// components/LogoutButton.tsx
"use client";

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

interface LogoutButtonProps {
  className?: string;
}

export default function LogoutButton({ className }: LogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
 
  const handleLogout = async () => {
    setIsLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push('/auth/login');
  };
 
  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={className || "text-sm font-medium text-slate-500 hover:text-slate-700"}
    >
      {isLoggingOut ? 'Signing out...' : 'Sign out'}
    </button>
  );
}