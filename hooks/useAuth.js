// hooks/useAuth.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function useAuth() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login'); // redirige si no hay token
    }
  }, [router]);
}
