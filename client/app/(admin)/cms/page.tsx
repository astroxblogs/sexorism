'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import dynamic from 'next/dynamic';

const Login = dynamic(() => import('./login/page'), { ssr: false });

export default function CmsEntry() {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const routeByRole = (role: string) => {
      const r = (role || '').toLowerCase();
      if (r === 'operator') router.replace('/cms/operator-dashboard');
      else if (r === 'admin') router.replace('/cms/admin-dashboard');
      else setShowLogin(true);
    };

    const bootstrap = async () => {
      // 1️⃣ No cookie token → show login
      const hasCookieToken = document.cookie.split('; ').some(c => c.startsWith('token='));
      if (!hasCookieToken) {
        console.log('No token cookie found → showing login');
        setShowLogin(true);
        return;
      }

      // 2️⃣ Try verifying token
      try {
        const { data } = await api.get(`/admin/verify-token?t=${Date.now()}`);
        if (cancelled) return;
        const verifiedRole = (data?.role || '').toLowerCase();
        if (verifiedRole === 'admin' || verifiedRole === 'operator') {
          sessionStorage.setItem('astrox_admin_role_session', verifiedRole);
          routeByRole(verifiedRole);
        } else {
          console.warn('Invalid or missing role → login');
          setShowLogin(true);
        }
      } catch (err) {
        console.warn('Verify-token failed → login');
        try { sessionStorage.removeItem('astrox_admin_role_session'); } catch {}
        setShowLogin(true);
      }
    };

    bootstrap();
    return () => { cancelled = true; };
  }, [router]);

  if (showLogin) return <Login />;

  return (
    <div className="min-h-[60vh] flex items-center justify-center text-gray-600">
      Checking your session…
    </div>
  );
}
