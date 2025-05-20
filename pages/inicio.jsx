// pages/inicio.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Inicio() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.replace('/login');
    }
  }, []);

  return (
    <div className="p-6">
      <Head>
        <title>VERTIMAR | INICIO</title> {/* Aquí va el título de la pestaña */}
      </Head>
      <h1 className="text-3xl font-bold">Bienvenido al panel principal</h1>
      {/* Acá irán los accesos al sistema ERP */}
    </div>
  );
}
