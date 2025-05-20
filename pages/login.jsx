import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import toast, { Toaster } from 'react-hot-toast';
import Head from 'next/head';

export default function Login() {
    
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) router.push('/inicio');
  }, []);

  
  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        toast.success('Inicio de sesión exitoso');
        router.push('/inicio');
      } else {
        toast.error(data.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      toast.error('Error en el servidor');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Head>
        <title>VERTIMAR | INICIAR SESION</title> {/* Aquí va el título de la pestaña */}
      </Head>
      {/* Left Form Container */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center bg-white p-8">
        <div className="w-full max-w-sm space-y-6">
          <h2 className="text-3xl font-bold text-gray-800 text-center">Iniciar Sesión</h2>
          <p className="text-center text-gray-500 text-sm">Bienvenido! Por favor, inicie sesión para continuar.</p>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Usuario</label>
            <input
              id="username"
              type="text"
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingrese su usuario"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              id="password"
              type="password"
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
            />
          </div>
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Iniciar sesión
          </button>
        </div>
      </div>

      {/* Right Image Container */}
      <div className="hidden md:flex w-1/2 bg-blue-600 text-white items-center justify-center relative">
        <img
          src="/login-bg.jpg"
          alt="Login background"
          className="absolute inset-0 object-cover w-full h-full opacity-20"
        />
        <div className="relative z-10 text-center px-6">
          <h3 className="text-2xl font-semibold mb-2">Bienvenido!</h3>
          <h2 className="text-4xl font-bold">DISTRIBUIDORA VERTIMAR SRL</h2>
        </div>
      </div>

      <Toaster />
    </div>
  );
}

Login.getLayout = (page) => page; // No usar layout
