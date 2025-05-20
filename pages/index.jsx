// pages/index.js (pantalla de inicio)
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    // token
    if (token) {
      router.replace('/inicio'); // Ya logueado
    } else {
      router.replace('/login'); // No logueado
    }
  }, []);

  return null; // O un loading spinner si preferís
}
