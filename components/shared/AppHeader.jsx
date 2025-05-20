import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { FiX, FiMenu } from 'react-icons/fi';
import Head from 'next/head';

function AppHeader() {
  const [showMenu, setShowMenu] = useState(false);
  const [role, setRole] = useState(null);
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const router = useRouter();

  useEffect(() => {
    setRole(localStorage.getItem("role"));
  }, []);

  // Nuevo useEffect para cerrar menús al cambiar de ruta
  useEffect(() => {
    // Cierra todos los menús cuando cambia la ruta
    const handleRouteChange = () => {
      setShowMenu(false);
      setOpenSubMenu(null);
    };

    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    router.push("/");
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
    setOpenSubMenu(null);
  };

  const toggleSubMenu = (menuName) => {
    setOpenSubMenu(openSubMenu === menuName ? null : menuName);
  };

  // Nuevo método para cerrar menús al hacer clic en un enlace
  const handleMenuItemClick = () => {
    setShowMenu(false);
    setOpenSubMenu(null);
  };

  const subMenuVariants = {
    open: { opacity: 1, y: 0, display: 'block' },
    closed: { opacity: 0, y: -10, display: 'none' },
  };

  const logoVariants = {
    hover: { scale: 1.1 },
    tap: { scale: 0.9 },
  };

  const menuItemVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  const logoutVariants = {
    hover: { scale: 1.1, backgroundColor: 'rgba(255, 0, 0, 0.2)' },
    tap: { scale: 0.9 },
  };

  // Componente personalizado para Link que cierra los menús al hacer clic
  const MenuLink = ({ href, className, children }) => {
    return (
      <Link href={href} className={className} onClick={handleMenuItemClick}>
        {children}
      </Link>
    );
  };

  return (
    <>
      <nav className="bg-blue-500 text-white py-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo (pegado a la izquierda y recarga la página) */}
          <motion.div
            variants={logoVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Link href="/" className="text-xl sm:text-3xl font-bold">
              VERTIMAR SRL
            </Link>
          </motion.div>

          {/* Menú para pantallas pequeñas (a la derecha) */}
          <div className="sm:hidden ml-auto">
            <motion.button onClick={toggleMenu} className="text-white focus:outline-none">
              {showMenu ? <FiX size={24} /> : <FiMenu size={24} />}
            </motion.button>
          </div>

          {/* Menú para pantallas grandes (centrado) */}
          <div className="hidden sm:flex flex-grow justify-center space-x-6 items-center">
            {/* VENTAS */}
            {(role === 'GERENTE' || role === 'VENDEDOR') && (
              <motion.div className="relative" variants={menuItemVariants} whileHover="hover" whileTap="tap">
                <button onClick={() => toggleSubMenu('ventas')} className="text-white focus:outline-none font-bold">
                  VENTAS
                </button>
                <motion.div
                  className="absolute top-full left-0 bg-white text-black shadow-md rounded-md p-2 mt-1 origin-top transition duration-200 ease-in-out"
                  variants={subMenuVariants}
                  initial="closed"
                  animate={openSubMenu === 'ventas' ? 'open' : 'closed'}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  style={{ minWidth: '200px' }}
                >
                  <MenuLink href="/ventas/RegistrarVenta" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap">Registrar Venta</MenuLink>
                  <MenuLink href="/ventas/ListaPrecios" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap border-b border-gray-200">Generar Lista de Precios</MenuLink>
                  {(role === 'GERENTE') && (
                  <MenuLink href="/ventas/HistorialVentas" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap mt-1">Historial de Ventas</MenuLink>
                  )}
                </motion.div>
              </motion.div>
            )}

            {/* INVENTARIO */}
            {(role === 'GERENTE' || role === 'VENDEDOR') && (
              <motion.div className="relative" variants={menuItemVariants} whileHover="hover" whileTap="tap">
                <button onClick={() => toggleSubMenu('inventario')} className="text-white focus:outline-none font-bold">
                  INVENTARIO
                </button>
                <motion.div
                  className="absolute top-full left-0 bg-white text-black shadow-md rounded-md p-2 mt-1 origin-top transition duration-200 ease-in-out"
                  variants={subMenuVariants}
                  initial="closed"
                  animate={openSubMenu === 'inventario' ? 'open' : 'closed'}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  style={{ minWidth: '200px' }}
                >
                  <MenuLink href="/inventario/Productos" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap">Productos</MenuLink>
                  <MenuLink href="/inventario/consultaStock" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap border-b border-gray-200">Consulta de STOCK</MenuLink>
                  <MenuLink href="/inventario/Remitos" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap">Remitos</MenuLink>
                </motion.div>
              </motion.div>
            )}

            {/* COMPRAS */}
            {role === 'GERENTE' && (
              <motion.div className="relative" variants={menuItemVariants} whileHover="hover" whileTap="tap">
                <button onClick={() => toggleSubMenu('compras')} className="text-white focus:outline-none font-bold">
                  COMPRAS
                </button>
                <motion.div
                  className="absolute top-full left-0 bg-white text-black shadow-md rounded-md p-2 mt-1 origin-top transition duration-200 ease-in-out"
                  variants={subMenuVariants}
                  initial="closed"
                  animate={openSubMenu === 'compras' ? 'open' : 'closed'}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  style={{ minWidth: '200px' }}
                >
                  <MenuLink href="/compras/RegistrarCompra" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap">Registrar Compra</MenuLink>
                  <MenuLink href="/compras/RegistrarGasto" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap border-b border-gray-200">Registrar Gasto</MenuLink>
                  <MenuLink href="/compras/HistorialCompras" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap">Historial de Compras</MenuLink>
                </motion.div>
              </motion.div>
            )}

            {/* FINANZAS */}
            {role === 'GERENTE' && (
              <motion.div className="relative" variants={menuItemVariants} whileHover="hover" whileTap="tap">
                <button onClick={() => toggleSubMenu('finanzas')} className="text-white focus:outline-none font-bold">
                  FINANZAS
                </button>
                <motion.div
                  className="absolute top-full left-0 bg-white text-black shadow-md rounded-md p-2 mt-1 origin-top transition duration-200 ease-in-out"
                  variants={subMenuVariants}
                  initial="closed"
                  animate={openSubMenu === 'finanzas' ? 'open' : 'closed'}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  style={{ minWidth: '200px' }}
                >
                  <MenuLink href="/finanzas/fondos" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap">Fondos</MenuLink>
                  <MenuLink href="/finanzas/ingresos" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap">Historial de Ingresos</MenuLink>
                  <MenuLink href="/finanzas/egresos" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap border-b border-gray-200">Historial de Egresos</MenuLink>
                  <MenuLink href="/finanzas/reportes" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap">Reportes Financieros</MenuLink>
                </motion.div>
              </motion.div>
            )}

            {/* EDICION */}
            {(role === 'GERENTE' || role === 'VENDEDOR') && (
              <motion.div className="relative" variants={menuItemVariants} whileHover="hover" whileTap="tap">
                <button onClick={() => toggleSubMenu('edicion')} className="text-white focus:outline-none font-bold">
                  EDICION
                </button>
                <motion.div
                  className="absolute top-full left-0 bg-white text-black shadow-md rounded-md p-2 mt-1 origin-top transition duration-200 ease-in-out"
                  variants={subMenuVariants}
                  initial="closed"
                  animate={openSubMenu === 'edicion' ? 'open' : 'closed'}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  style={{ minWidth: '200px' }}
                >
                  <MenuLink href="/edicion/Clientes" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap">Clientes</MenuLink>
                  <MenuLink href="/edicion/Proveedores" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap">Proveedores</MenuLink>
                  {(role === 'GERENTE') && (
                  <MenuLink href="/edicion/Empleados" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap">Empleados</MenuLink>
                  )}
                </motion.div>
              </motion.div>
            )}
          </div>

          {/* Cerrar sesión (pegado a la derecha en escritorio) */}
          <motion.button
            onClick={handleLogout}
            className="text-white focus:outline-none bg-red-500 hover:bg-red-600 px-4 py-2 rounded font-bold ml-auto hidden sm:block" // Solo se muestra en pantallas grandes
            variants={logoutVariants}
            whileHover="hover"
            whileTap="tap"
          >
            Cerrar Sesión
          </motion.button>
        </div>

        {/* Menu para pantallas pequeñas (incluye Cerrar Sesión) */}
        {showMenu && (
          <div className="sm:hidden bg-blue-500 py-2 px-4 flex flex-col items-center">
            {(role === 'GERENTE' || role === 'VENDEDOR') && (
              <div className="w-full mb-2">
                <motion.button
                  onClick={() => toggleSubMenu('ventas-mobile')}
                  className="w-full text-white py-2 focus:outline-none text-left font-bold"
                >
                  VENTAS
                </motion.button>
                <motion.div
                  variants={subMenuVariants}
                  initial="closed"
                  animate={openSubMenu === 'ventas-mobile' ? 'open' : 'closed'}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <MenuLink href="/ventas/RegistrarVenta" className="block py-2 px-4 hover:bg-blue-600">Registrar Venta</MenuLink>
                  <MenuLink href="/ventas/ListaPrecios" className="block py-2 px-4 hover:bg-blue-600">Generar Lista de Precios</MenuLink>
                  {(role === 'GERENTE') && (
                    <MenuLink href="/ventas/HistorialVentas" className="block py-2 px-4 hover:bg-blue-600">Historial de Ventas</MenuLink>
                  )}
                  
                </motion.div>
              </div>
            )}

            {(role === 'GERENTE' || role === 'VENDEDOR') && (
              <div className="w-full mb-2">
                <motion.button
                  onClick={() => toggleSubMenu('inventario-mobile')}
                  className="w-full text-white py-2 focus:outline-none text-left font-bold"
                >
                  INVENTARIO
                </motion.button>
                <motion.div
                  variants={subMenuVariants}
                  initial="closed"
                  animate={openSubMenu === 'inventario-mobile' ? 'open' : 'closed'}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <MenuLink href="/inventario/Productos" className="block py-2 px-4 hover:bg-blue-600">Productos</MenuLink>
                  <MenuLink href="/inventario/consultaStock" className="block py-2 px-4 hover:bg-blue-600">Consulta de STOCK</MenuLink>
                  <MenuLink href="/inventario/Remitos" className="block py-2 px-4 hover:bg-blue-600">Remitos</MenuLink>
                </motion.div>
              </div>
            )}

            {role === 'GERENTE' && (
              <div className="w-full mb-2">
                <motion.button
                  onClick={() => toggleSubMenu('compras-mobile')}
                  className="w-full text-white py-2 focus:outline-none text-left font-bold"
                >
                  COMPRAS
                </motion.button>
                <motion.div
                  variants={subMenuVariants}
                  initial="closed"
                  animate={openSubMenu === 'compras-mobile' ? 'open' : 'closed'}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <MenuLink href="/compras/RegistrarCompra" className="block py-2 px-4 hover:bg-blue-600">Registrar Compra</MenuLink>
                  <MenuLink href="/compras/RegistrarGasto" className="block py-2 px-4 hover:bg-blue-600">Registrar Gasto</MenuLink>
                  <MenuLink href="/compras/HistorialCompras" className="block py-2 px-4 hover:bg-blue-600">Historial de Compras</MenuLink>
                </motion.div>
              </div>
            )}

            {role === 'GERENTE' && (
              <div className="w-full mb-2">
                <motion.button
                  onClick={() => toggleSubMenu('finanzas-mobile')}
                  className="w-full text-white py-2 focus:outline-none text-left font-bold"
                >
                  FINANZAS
                </motion.button>
                <motion.div
                  variants={subMenuVariants}
                  initial="closed"
                  animate={openSubMenu === 'finanzas-mobile' ? 'open' : 'closed'}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <MenuLink href="/fondos" className="block py-2 px-4 hover:bg-blue-600">Fondos</MenuLink>
                  <MenuLink href="/historial-ingresos" className="block py-2 px-4 hover:bg-blue-600">Historial de Ingresos</MenuLink>
                  <MenuLink href="/historial-egresos" className="block py-2 px-4 hover:bg-blue-600">Historial de Egresos</MenuLink>
                  <MenuLink href="/historial-egresos" className="block py-2 px-4 hover:bg-blue-600">Reportes Financieros</MenuLink>
                </motion.div>
              </div>
            )}

            {(role === 'GERENTE' || role === 'VENDEDOR') && (
              <div className="w-full mb-2">
                <motion.button
                  onClick={() => toggleSubMenu('edicion-mobile')}
                  className="w-full text-white py-2 focus:outline-none text-left font-bold"
                >
                  EDICION
                </motion.button>
                <motion.div
                  variants={subMenuVariants}
                  initial="closed"
                  animate={openSubMenu === 'edicion-mobile' ? 'open' : 'closed'}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <MenuLink href="/edicion/Clientes" className="block py-2 px-4 hover:bg-blue-600">Clientes</MenuLink>
                  <MenuLink href="/edicion/Proveedores" className="block py-2 px-4 hover:bg-blue-600">Proveedores</MenuLink>
                  {(role === 'GERENTE') && (
                    <MenuLink href="/edicion/Empleados" className="block py-2 px-4 hover:bg-blue-600">Empleados</MenuLink>
                  )}
                </motion.div>
              </div>
            )}

            <motion.button
              onClick={handleLogout}
              className="w-full text-white py-2 focus:outline-none bg-red-500 hover:bg-red-600 rounded font-bold"
              variants={logoutVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Cerrar Sesión
            </motion.button>
          </div>
        )}
      </nav>
    </>
  );
}

export default AppHeader;