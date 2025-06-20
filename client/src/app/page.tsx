'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN;

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch(`${APP_DOMAIN}/api/v1/checkUser`, {
          method: 'GET',
          credentials: 'include',
        });

        if (response.status === 200) {
          router.push('/user');
        } else {
          router.push('/authenticate');
        }
      } catch (error) {
        router.push('/authenticate');
      }
    };

    checkUser();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-lg">
      Loading...
    </div>
  );
}

