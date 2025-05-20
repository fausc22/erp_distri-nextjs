import { useState, useEffect, Fragment } from 'react';
import { MdAdd, MdRefresh, MdArrowUpward, MdArrowDownward, MdSwapHoriz, MdHistory } from "react-icons/md";
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import Head from 'next/head';
import useAuth from '../../hooks/useAuth';

export default function Tesoreria() {
  // Estados para las cuentas y movimientos
  const [cuentas, setCuentas] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState(null);
  
  // Estados para modales
  const [mostrarModalCuenta, setMostrarModalCuenta] = useState(false);
  const [mostrarModalMovimiento, setMostrarModalMovimiento] = useState(false);
  const [mostrarModalTransferencia, setMostrarModalTransferencia] = useState(false);
  const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false);
  
  // Estados para formularios
  const [nuevaCuenta, setNuevaCuenta] = useState({ nombre: '', saldo: 0 });
  const [nuevoMovimiento, setNuevoMovimiento] = useState({ 
    cuenta_id: '', 
    tipo: 'INGRESO', 
    origen: 'ingreso manual', 
    monto: 0, 
    descripcion: '' 
  });
  const [nuevaTransferencia, setNuevaTransferencia] = useState({
    cuenta_origen: '',
    cuenta_destino: '',
    monto: 0,
    descripcion: ''
  });
  
  // Estado para filtrado de movimientos
  const [filtroMovimientos, setFiltroMovimientos] = useState({
    cuenta_id: 'todas',
    tipo: 'todos',
    desde: '',
    hasta: '',
    busqueda: ''
  });
  
  // Control de vistas
  const [vistaActiva, setVistaActiva] = useState('cuentas'); // 'cuentas', 'movimientos'
  
  // Uso del hook de autenticación
  useAuth();
  
  // Cargar datos al iniciar
  useEffect(() => {
    cargarCuentas();
    cargarMovimientos();
  }, []);
  
  // Función para cargar las cuentas
  const cargarCuentas = async () => {
    try {
      const response = await axios.get('http://localhost:3001/finanzas/cuentas');
      if (response.data.success) {
        setCuentas(response.data.data);
      } else {
        toast.error("Error al cargar las cuentas");
      }
    } catch (error) {
      console.error("Error al obtener cuentas:", error);
      toast.error("No se pudieron cargar las cuentas");
    }
  };
  
  // Función para cargar los movimientos
  const cargarMovimientos = async (filtros = {}) => {
    try {
      // Construimos los parámetros de consulta basados en los filtros
      const params = new URLSearchParams();
      if (filtros.cuenta_id && filtros.cuenta_id !== 'todas') params.append('cuenta_id', filtros.cuenta_id);
      if (filtros.tipo && filtros.tipo !== 'todos') params.append('tipo', filtros.tipo);
      if (filtros.desde) params.append('desde', filtros.desde);
      if (filtros.hasta) params.append('hasta', filtros.hasta);
      if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
      
      const response = await axios.get(`http://localhost:3001/finanzas/movimientos?${params.toString()}`);
      if (response.data.success) {
        setMovimientos(response.data.data);
      } else {
        toast.error("Error al cargar los movimientos");
      }
    } catch (error) {
      console.error("Error al obtener movimientos:", error);
      toast.error("No se pudieron cargar los movimientos");
    }
  };
  
  // Función para crear una nueva cuenta
  const crearCuenta = async () => {
    try {
      if (!nuevaCuenta.nombre.trim()) {
        toast.error("El nombre de la cuenta es obligatorio");
        return;
      }
      
      const response = await axios.post('http://localhost:3001/finanzas/cuentas', nuevaCuenta);
      if (response.data.success) {
        toast.success("Cuenta creada exitosamente");
        cargarCuentas();
        setMostrarModalCuenta(false);
        setNuevaCuenta({ nombre: '', saldo: 0 });
      } else {
        toast.error(response.data.message || "Error al crear la cuenta");
      }
    } catch (error) {
      console.error("Error al crear cuenta:", error);
      toast.error("No se pudo crear la cuenta");
    }
  };
  
  // Función para registrar un nuevo movimiento
  const registrarMovimiento = async () => {
    try {
      if (!nuevoMovimiento.cuenta_id) {
        toast.error("Debe seleccionar una cuenta");
        return;
      }
      
      if (nuevoMovimiento.monto <= 0) {
        toast.error("El monto debe ser mayor a cero");
        return;
      }
      
      const response = await axios.post('http://localhost:3001/finanzas/movimientos', nuevoMovimiento);
      if (response.data.success) {
        toast.success(`${nuevoMovimiento.tipo === 'INGRESO' ? 'Ingreso' : 'Egreso'} registrado exitosamente`);
        cargarCuentas();
        cargarMovimientos();
        setMostrarModalMovimiento(false);
        setNuevoMovimiento({ 
          cuenta_id: '', 
          tipo: 'INGRESO', 
          origen: 'ingreso manual', 
          monto: 0, 
          descripcion: '' 
        });
      } else {
        toast.error(response.data.message || "Error al registrar el movimiento");
      }
    } catch (error) {
      console.error("Error al registrar movimiento:", error);
      toast.error("No se pudo registrar el movimiento");
    }
  };
  
  // Función para realizar una transferencia entre cuentas
  const realizarTransferencia = async () => {
    try {
      if (!nuevaTransferencia.cuenta_origen || !nuevaTransferencia.cuenta_destino) {
        toast.error("Debe seleccionar ambas cuentas");
        return;
      }
      
      if (nuevaTransferencia.cuenta_origen === nuevaTransferencia.cuenta_destino) {
        toast.error("Las cuentas de origen y destino deben ser diferentes");
        return;
      }
      
      if (nuevaTransferencia.monto <= 0) {
        toast.error("El monto debe ser mayor a cero");
        return;
      }
      
      const response = await axios.post('http://localhost:3001/finanzas/transferencias', nuevaTransferencia);
      if (response.data.success) {
        toast.success("Transferencia realizada exitosamente");
        cargarCuentas();
        cargarMovimientos();
        setMostrarModalTransferencia(false);
        setNuevaTransferencia({
          cuenta_origen: '',
          cuenta_destino: '',
          monto: 0,
          descripcion: ''
        });
      } else {
        toast.error(response.data.message || "Error al realizar la transferencia");
      }
    } catch (error) {
      console.error("Error al realizar transferencia:", error);
      toast.error("No se pudo realizar la transferencia");
    }
  };
  
  // Función para ver detalles de una cuenta
  const verDetalleCuenta = async (cuenta) => {
    setCuentaSeleccionada(cuenta);
    // Cargar movimientos específicos de esta cuenta
    try {
      const response = await axios.get(`http://localhost:3001/finanzas/movimientos?cuenta_id=${cuenta.id}`);
      if (response.data.success) {
        setMovimientos(response.data.data);
        setMostrarModalDetalle(true);
      } else {
        toast.error("Error al cargar los movimientos de la cuenta");
      }
    } catch (error) {
      console.error("Error al obtener movimientos de la cuenta:", error);
      toast.error("No se pudieron cargar los movimientos de la cuenta");
    }
  };
  
  // Función para aplicar filtros a los movimientos
  const aplicarFiltros = () => {
    cargarMovimientos(filtroMovimientos);
  };
  
  // Función para resetear filtros
  const resetearFiltros = () => {
    setFiltroMovimientos({
      cuenta_id: 'todas',
      tipo: 'todos',
      desde: '',
      hasta: '',
      busqueda: ''
    });
    cargarMovimientos();
  };
  
  // Funciones para formatear moneda y fecha
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(value);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Cálculo de totales
  const totalSaldos = cuentas.reduce((acc, cuenta) => acc + parseFloat(cuenta.saldo), 0);
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-4">
      <Head>
        <title>VERTIMAR | TESORERÍA</title>
        <meta name="description" content="Gestión de tesorería en el sistema VERTIMAR" />
      </Head>
      
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">GESTIÓN DE FONDOS</h1>
        
        {/* Pestañas de navegación */}
        <div className="flex border-b mb-6">
          <button 
            className={`py-2 px-4 font-medium ${vistaActiva === 'cuentas' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500 hover:text-green-500'}`}
            onClick={() => setVistaActiva('cuentas')}
          >
            Cuentas y Saldos
          </button>
          <button 
            className={`py-2 px-4 font-medium ${vistaActiva === 'movimientos' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
            onClick={() => setVistaActiva('movimientos')}
          >
            Historial de Movimientos
          </button>
        </div>
        
        {/* Vista de Cuentas y Saldos */}
        {vistaActiva === 'cuentas' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Cuentas Disponibles</h2>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setMostrarModalCuenta(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center"
                >
                  <MdAdd className="mr-1" /> Nueva Cuenta
                </button>
                <button 
                  onClick={cargarCuentas}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
                >
                  <MdRefresh className="mr-1" /> Actualizar
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto bg-white rounded shadow">
              <table className="w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-3 text-left">ID</th>
                    <th className="p-3 text-left">Nombre</th>
                    <th className="p-3 text-right">Saldo</th>
                    <th className="p-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cuentas.length > 0 ? (
                    cuentas.map((cuenta) => (
                      <tr key={cuenta.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{cuenta.id}</td>
                        <td className="p-3 font-medium">{cuenta.nombre}</td>
                        <td className={`p-3 text-right font-semibold ${parseFloat(cuenta.saldo) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(cuenta.saldo)}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex justify-center space-x-2">
                            <button 
                              onClick={() => {
                                setNuevoMovimiento({...nuevoMovimiento, cuenta_id: cuenta.id, tipo: 'INGRESO'});
                                setMostrarModalMovimiento(true);
                              }}
                              className="bg-green-500 hover:bg-green-600 text-white p-2 rounded"
                              title="Registrar Ingreso"
                            >
                              <MdArrowDownward />
                            </button>
                            <button 
                              onClick={() => {
                                setNuevoMovimiento({...nuevoMovimiento, cuenta_id: cuenta.id, tipo: 'EGRESO'});
                                setMostrarModalMovimiento(true);
                              }}
                              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded"
                              title="Registrar Egreso"
                            >
                              <MdArrowUpward />
                            </button>
                            <button 
                              onClick={() => {
                                setNuevaTransferencia({...nuevaTransferencia, cuenta_origen: cuenta.id});
                                setMostrarModalTransferencia(true);
                              }}
                              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
                              title="Realizar Transferencia"
                            >
                              <MdSwapHoriz />
                            </button>
                            <button 
                              onClick={() => verDetalleCuenta(cuenta)}
                              className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded"
                              title="Ver Historial"
                            >
                              <MdHistory />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="p-4 text-center text-gray-500">
                        No hay cuentas registradas
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-gray-100">
                  <tr>
                    <td colSpan="2" className="p-3 text-right font-bold">Total:</td>
                    <td className={`p-3 text-right font-bold ${totalSaldos >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(totalSaldos)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => setMostrarModalMovimiento(true)}
                  className="bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white p-4 rounded-lg flex flex-col items-center"
                >
                  <MdArrowDownward className="text-3xl mb-2" />
                  <span className="font-semibold">Registrar Ingreso</span>
                </button>
                <button 
                  onClick={() => {
                    setNuevoMovimiento({...nuevoMovimiento, tipo: 'EGRESO'});
                    setMostrarModalMovimiento(true);
                  }}
                  className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white p-4 rounded-lg flex flex-col items-center"
                >
                  <MdArrowUpward className="text-3xl mb-2" />
                  <span className="font-semibold">Registrar Egreso</span>
                </button>
                <button 
                  onClick={() => setMostrarModalTransferencia(true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white p-4 rounded-lg flex flex-col items-center"
                >
                  <MdSwapHoriz className="text-3xl mb-2" />
                  <span className="font-semibold">Realizar Transferencia</span>
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Vista de Historial de Movimientos */}
        {vistaActiva === 'movimientos' && (
          <div>
            <div className="bg-white p-4 rounded shadow mb-6">
              <h2 className="text-lg font-semibold mb-4">Filtros de Búsqueda</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cuenta</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={filtroMovimientos.cuenta_id}
                    onChange={(e) => setFiltroMovimientos({...filtroMovimientos, cuenta_id: e.target.value})}
                  >
                    <option value="todas">Todas las cuentas</option>
                    {cuentas.map(cuenta => (
                      <option key={cuenta.id} value={cuenta.id}>{cuenta.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={filtroMovimientos.tipo}
                    onChange={(e) => setFiltroMovimientos({...filtroMovimientos, tipo: e.target.value})}
                  >
                    <option value="todos">Todos</option>
                    <option value="INGRESO">Ingresos</option>
                    <option value="EGRESO">Egresos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                  <input
                    type="date"
                    className="w-full p-2 border rounded"
                    value={filtroMovimientos.desde}
                    onChange={(e) => setFiltroMovimientos({...filtroMovimientos, desde: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                  <input
                    type="date"
                    className="w-full p-2 border rounded"
                    value={filtroMovimientos.hasta}
                    onChange={(e) => setFiltroMovimientos({...filtroMovimientos, hasta: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex mt-4">
                <input
                  type="text"
                  placeholder="Buscar por origen o descripción..."
                  className="flex-1 p-2 border rounded-l"
                  value={filtroMovimientos.busqueda}
                  onChange={(e) => setFiltroMovimientos({...filtroMovimientos, busqueda: e.target.value})}
                />
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r"
                  onClick={aplicarFiltros}
                >
                  Buscar
                </button>
              </div>
              <div className="mt-2 text-right">
                <button
                  className="text-blue-600 hover:text-blue-800 text-sm"
                  onClick={resetearFiltros}
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto bg-white rounded shadow">
              <table className="w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-3 text-left">ID</th>
                    <th className="p-3 text-left">Fecha</th>
                    <th className="p-3 text-left">Cuenta</th>
                    <th className="p-3 text-left">Tipo</th>
                    <th className="p-3 text-left">Origen</th>
                    <th className="p-3 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.length > 0 ? (
                    movimientos.map((movimiento) => {
                      const cuentaAsociada = cuentas.find(c => c.id === movimiento.cuenta_id) || { nombre: 'Desconocida' };
                      return (
                        <tr key={movimiento.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{movimiento.id}</td>
                          <td className="p-3">{formatDate(movimiento.fecha)}</td>
                          <td className="p-3">{cuentaAsociada.nombre}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              movimiento.tipo === 'INGRESO' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {movimiento.tipo}
                            </span>
                          </td>
                          <td className="p-3">{movimiento.origen}</td>
                          <td className={`p-3 text-right font-semibold ${
                            movimiento.tipo === 'INGRESO' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(movimiento.monto)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-4 text-center text-gray-500">
                        No hay movimientos registrados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal para crear nueva cuenta */}
      {mostrarModalCuenta && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Nueva Cuenta</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la cuenta</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={nuevaCuenta.nombre}
                onChange={(e) => setNuevaCuenta({...nuevaCuenta, nombre: e.target.value})}
                placeholder="Ej: Caja, Banco, Mercado Pago..."
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Saldo inicial</label>
              <input
                type="number"
                step="0.01"
                className="w-full p-2 border rounded"
                value={nuevaCuenta.saldo}
                onChange={(e) => setNuevaCuenta({...nuevaCuenta, saldo: parseFloat(e.target.value) || 0})}
              />
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setMostrarModalCuenta(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={crearCuenta}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal para registrar movimiento */}
      {mostrarModalMovimiento && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {nuevoMovimiento.tipo === 'INGRESO' ? 'Registrar Ingreso' : 'Registrar Egreso'}
            </h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cuenta</label>
              <select
                className="w-full p-2 border rounded"
                value={nuevoMovimiento.cuenta_id}
                onChange={(e) => setNuevoMovimiento({...nuevoMovimiento, cuenta_id: e.target.value})}
              >
                <option value="">Seleccionar cuenta</option>
                {cuentas.map(cuenta => (
                  <option key={cuenta.id} value={cuenta.id}>{cuenta.nombre}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Movimiento</label>
              <div className="flex">
                <button
                  className={`flex-1 py-2 text-center ${
                    nuevoMovimiento.tipo === 'INGRESO'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  } rounded-l`}
                  onClick={() => setNuevoMovimiento({...nuevoMovimiento, tipo: 'INGRESO'})}
                >
                  INGRESO
                </button>
                <button
                  className={`flex-1 py-2 text-center ${
                    nuevoMovimiento.tipo === 'EGRESO'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  } rounded-r`}
                  onClick={() => setNuevoMovimiento({...nuevoMovimiento, tipo: 'EGRESO'})}
                >
                  EGRESO
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Origen/Concepto</label>
              <select
                className="w-full p-2 border rounded"
                value={nuevoMovimiento.origen}
                onChange={(e) => setNuevoMovimiento({...nuevoMovimiento, origen: e.target.value})}
              >
                {nuevoMovimiento.tipo === 'INGRESO' ? (
                  <>
                    <option value="ingreso manual">Ingreso Manual</option>
                    <option value="venta">Venta</option>
                    <option value="cobro">Cobro de Deuda</option>
                    <option value="transferencia">Transferencia Recibida</option>
                    <option value="otro">Otro</option>
                  </>
                ) : (
                  <>
                    <option value="gasto manual">Gasto Manual</option>
                    <option value="compra">Compra</option>
                    <option value="pago">Pago a Proveedor</option>
                    <option value="transferencia">Transferencia Enviada</option>
                    <option value="otro">Otro</option>
                  </>
                )}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
              <input
                type="number"
                step="0.01"
                className="w-full p-2 border rounded"
                value={nuevoMovimiento.monto}
                onChange={(e) => setNuevoMovimiento({...nuevoMovimiento, monto: parseFloat(e.target.value) || 0})}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
              <textarea
                className="w-full p-2 border rounded"
                rows="2"
                value={nuevoMovimiento.descripcion}
                onChange={(e) => setNuevoMovimiento({...nuevoMovimiento, descripcion: e.target.value})}
                placeholder="Añadir una descripción..."
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setMostrarModalMovimiento(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={registrarMovimiento}
                className={`px-4 py-2 text-white rounded ${
                  nuevoMovimiento.tipo === 'INGRESO'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {nuevoMovimiento.tipo === 'INGRESO' ? 'Registrar Ingreso' : 'Registrar Egreso'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal para transferencia entre cuentas */}
      {mostrarModalTransferencia && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Transferencia entre Cuentas</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cuenta de Origen</label>
              <select
                className="w-full p-2 border rounded"
                value={nuevaTransferencia.cuenta_origen}
                onChange={(e) => setNuevaTransferencia({...nuevaTransferencia, cuenta_origen: e.target.value})}
              >
                <option value="">Seleccionar cuenta de origen</option>
                {cuentas.map(cuenta => (
                  <option key={cuenta.id} value={cuenta.id}>{cuenta.nombre}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cuenta de Destino</label>
              <select
                className="w-full p-2 border rounded"
                value={nuevaTransferencia.cuenta_destino}
                onChange={(e) => setNuevaTransferencia({...nuevaTransferencia, cuenta_destino: e.target.value})}
              >
                <option value="">Seleccionar cuenta de destino</option>
                {cuentas.map(cuenta => (
                  <option key={cuenta.id} value={cuenta.id}>{cuenta.nombre}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto a Transferir</label>
              <input
                type="number"
                step="0.01"
                className="w-full p-2 border rounded"
                value={nuevaTransferencia.monto}
                onChange={(e) => setNuevaTransferencia({...nuevaTransferencia, monto: parseFloat(e.target.value) || 0})}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
              <textarea
                className="w-full p-2 border rounded"
                rows="2"
                value={nuevaTransferencia.descripcion}
                onChange={(e) => setNuevaTransferencia({...nuevaTransferencia, descripcion: e.target.value})}
                placeholder="Añadir una descripción..."
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setMostrarModalTransferencia(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={realizarTransferencia}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Realizar Transferencia
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de detalle de cuenta */}
      {mostrarModalDetalle && cuentaSeleccionada && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Movimientos de: {cuentaSeleccionada.nombre}</h2>
            <h3 className="text-lg font-semibold mb-6">
              Saldo actual: <span className={parseFloat(cuentaSeleccionada.saldo) >= 0 ? 'text-green-600' : 'text-red-600'}>
                {formatCurrency(cuentaSeleccionada.saldo)}
              </span>
            </h3>
            
            <div className="overflow-x-auto bg-white rounded shadow mb-6">
              <table className="w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-3 text-left">ID</th>
                    <th className="p-3 text-left">Fecha</th>
                    <th className="p-3 text-left">Tipo</th>
                    <th className="p-3 text-left">Origen</th>
                    <th className="p-3 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.length > 0 ? (
                    movimientos.map((movimiento) => (
                      <tr key={movimiento.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{movimiento.id}</td>
                        <td className="p-3">{formatDate(movimiento.fecha)}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            movimiento.tipo === 'INGRESO' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {movimiento.tipo}
                          </span>
                        </td>
                        <td className="p-3">{movimiento.origen}</td>
                        <td className={`p-3 text-right font-semibold ${
                          movimiento.tipo === 'INGRESO' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(movimiento.monto)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-4 text-center text-gray-500">
                        No hay movimientos para esta cuenta
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={() => setMostrarModalDetalle(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Toaster position="top-right" />
    </div>
  );
}