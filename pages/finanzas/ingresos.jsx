import { useState, useEffect, Fragment } from 'react';
import { 
  MdSearch, 
  MdAdd, 
  MdFilterList, 
  MdClearAll, 
  MdArrowDownward, 
  MdRemoveRedEye,
  MdPrint,
  MdAutorenew
} from "react-icons/md";
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import Head from 'next/head';
import useAuth from '../../hooks/useAuth';

export default function HistorialIngresos() {
  // Estados para datos
  const [ingresos, setIngresos] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [totalIngresos, setTotalIngresos] = useState(0);
  
  // Estados para filtros
  const [filtros, setFiltros] = useState({
    desde: '',
    hasta: '',
    tipo: 'todos',
    cuenta: 'todas',
    busqueda: ''
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  
  // Estados para modales
  const [mostrarModalNuevoIngreso, setMostrarModalNuevoIngreso] = useState(false);
  const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false);
  
  // Estados para detalle
  const [detalleData, setDetalleData] = useState(null);
  const [tipoDetalle, setTipoDetalle] = useState(''); // 'venta' o 'ingreso'
  
  // Estado para nuevo ingreso
  const [nuevoIngreso, setNuevoIngreso] = useState({
    cuenta_id: '',
    monto: '',
    origen: 'ingreso manual',
    descripcion: ''
  });
  
  // Estados para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
  const [totalRegistros, setTotalRegistros] = useState(0);
  
  // Estado para carga
  const [cargando, setCargando] = useState(false);
  
  // Constante para el endpoint base
  const API_BASE_URL = 'http://localhost:3001/finanzas';
  
  // Usar hook de autenticación
  useAuth();
  
  // Cargar datos iniciales
  useEffect(() => {
    cargarIngresos();
    cargarCuentas();
  }, []);
  
  // Función para cargar ingresos
  const cargarIngresos = async (page = 1, filtrosActuales = filtros) => {
    setCargando(true);
    try {
      // Construir parámetros de consulta
      const params = new URLSearchParams({
        limit: registrosPorPagina,
        page: page
      });
      
      // Añadir filtros
      if (filtrosActuales.desde) params.append('desde', filtrosActuales.desde);
      if (filtrosActuales.hasta) params.append('hasta', filtrosActuales.hasta);
      if (filtrosActuales.tipo !== 'todos') params.append('tipo', filtrosActuales.tipo);
      if (filtrosActuales.cuenta !== 'todas') params.append('cuenta', filtrosActuales.cuenta);
      if (filtrosActuales.busqueda) params.append('busqueda', filtrosActuales.busqueda);
      
      const response = await axios.get(`http://localhost:3001/finanzas/ingresos/historial?${params.toString()}`);
      
      if (response.data.success) {
        setIngresos(response.data.data);
        setTotalIngresos(response.data.total);
        setTotalRegistros(response.data.count || response.data.data.length);
      } else {
        toast.error("Error al cargar los ingresos");
      }
    } catch (error) {
      console.error("Error al obtener ingresos:", error);
      toast.error("No se pudieron cargar los ingresos");
    } finally {
      setCargando(false);
    }
  };
  
  // Función para cargar cuentas
  const cargarCuentas = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/finanzas/ingresos/cuentas`);
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
  
  // Función para aplicar filtros
  const aplicarFiltros = () => {
    setPaginaActual(1);
    cargarIngresos(1, filtros);
  };
  
  // Función para limpiar filtros
  const limpiarFiltros = () => {
    const filtrosLimpios = {
      desde: '',
      hasta: '',
      tipo: 'todos',
      cuenta: 'todas',
      busqueda: ''
    };
    setFiltros(filtrosLimpios);
    setPaginaActual(1);
    cargarIngresos(1, filtrosLimpios);
  };
  
  // Función para ver detalle
  const verDetalle = async (id, tipo) => {
  try {
    // Verificar que tenemos un ID válido
    if (!id) {
      toast.error("No se puede obtener detalle: ID no válido");
      return;
    }
    
    console.log(`Consultando detalle de ${tipo} con ID: ${id}`);
    let response;

    if (tipo === 'Venta') {
      response = await axios.get(`http://localhost:3001/ingresos/detalle-venta/${id}`);
      setTipoDetalle('venta');
    } else {
      response = await axios.get(`http://localhost:3001/ingresos/detalle-ingreso/${id}`);
      setTipoDetalle('ingreso');
    }
    
    if (response.data.success) {
      setDetalleData(response.data.data);
      setMostrarModalDetalle(true);
    } else {
      toast.error(`Error al cargar detalle del ${tipo.toLowerCase()}`);
    }
  } catch (error) {
    console.error(`Error al obtener detalle:`, error);
    toast.error(`No se pudo cargar el detalle. ${error.message}`);
  }
};
  
  // Función para registrar un nuevo ingreso
  const registrarNuevoIngreso = async () => {
    // Validaciones
    if (!nuevoIngreso.cuenta_id) {
      toast.error("Debe seleccionar una cuenta");
      return;
    }
    
    if (!nuevoIngreso.monto || parseFloat(nuevoIngreso.monto) <= 0) {
      toast.error("El monto debe ser mayor a cero");
      return;
    }
    
    try {
      const response = await axios.post(`http://localhost:3001/finanzas/ingresos/registrar`, nuevoIngreso);
      
      if (response.data.success) {
        toast.success("Ingreso registrado exitosamente");
        setMostrarModalNuevoIngreso(false);
        cargarIngresos();
        
        // Limpiar formulario
        setNuevoIngreso({
          cuenta_id: '',
          monto: '',
          origen: 'ingreso manual',
          descripcion: ''
        });
      } else {
        toast.error(response.data.message || "Error al registrar el ingreso");
      }
    } catch (error) {
      console.error("Error al registrar ingreso:", error);
      toast.error("No se pudo registrar el ingreso");
    }
  };
  
  // Función para cambiar de página
  const cambiarPagina = (pagina) => {
    setPaginaActual(pagina);
    cargarIngresos(pagina);
  };
  
  // Función para imprimir ingreso
  const imprimirIngreso = (ingreso) => {
    toast.info("Funcionalidad de impresión en desarrollo");
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
  
  // Cálculos para paginación
  const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-4">
      <Head>
        <title>VERTIMAR | HISTORIAL DE INGRESOS</title>
        <meta name="description" content="Historial de ingresos en el sistema VERTIMAR" />
      </Head>
      
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">HISTORIAL DE INGRESOS</h1>
        
        {/* Barra de acciones */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <div className="flex items-center w-full md:w-auto mb-4 md:mb-0">
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                placeholder="Buscar..."
                value={filtros.busqueda}
                onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
                onKeyDown={(e) => e.key === 'Enter' && aplicarFiltros()}
              />
              <MdSearch className="absolute left-3 top-2.5 text-gray-400 text-xl" />
            </div>
            <button
              className="ml-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
              onClick={aplicarFiltros}
              title="Buscar"
            >
              <MdSearch size={24} />
            </button>
            <button
              className="ml-2 bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-lg"
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              title="Filtros avanzados"
            >
              <MdFilterList size={24} />
            </button>
          </div>
          
          <div className="flex w-full md:w-auto justify-between md:justify-end space-x-2">
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
              onClick={() => setMostrarModalNuevoIngreso(true)}
            >
              <MdAdd className="mr-1" /> Nuevo Ingreso
            </button>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
              onClick={() => cargarIngresos()}
            >
              <MdAutorenew className="mr-1" /> Actualizar
            </button>
          </div>
        </div>
        
        {/* Filtros avanzados */}
        {mostrarFiltros && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6 border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Filtros Avanzados</h2>
              <button
                className="text-gray-600 hover:text-gray-800 flex items-center"
                onClick={limpiarFiltros}
              >
                <MdClearAll className="mr-1" /> Limpiar filtros
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded"
                  value={filtros.desde}
                  onChange={(e) => setFiltros({...filtros, desde: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded"
                  value={filtros.hasta}
                  onChange={(e) => setFiltros({...filtros, hasta: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  className="w-full p-2 border rounded"
                  value={filtros.tipo}
                  onChange={(e) => setFiltros({...filtros, tipo: e.target.value})}
                >
                  <option value="todos">Todos</option>
                  <option value="Venta">Ventas</option>
                  <option value="INGRESO">Ingresos manuales</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cuenta</label>
                <select
                  className="w-full p-2 border rounded"
                  value={filtros.cuenta}
                  onChange={(e) => setFiltros({...filtros, cuenta: e.target.value})}
                >
                  <option value="todas">Todas</option>
                  {cuentas.map((cuenta, index) => (
                    <option key={index} value={cuenta}>{cuenta}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                onClick={aplicarFiltros}
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        )}
        
        {/* Vista de tabla */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Resumen */}
          <div className="bg-gray-800 text-white p-4">
            <div className="flex flex-col md:flex-row justify-between">
              <h2 className="text-xl font-semibold">Resumen de Ingresos</h2>
              <div className="mt-2 md:mt-0">
                <span className="mr-2">Total:</span>
                <span className="font-bold text-lg">{formatCurrency(totalIngresos)}</span>
              </div>
            </div>
          </div>
          
          {/* Tabla de escritorio */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Fecha</th>
                  <th className="p-3 text-left">Tipo</th>
                  <th className="p-3 text-left">Referencia</th>
                  <th className="p-3 text-left">Descripción/Origen</th>
                  <th className="p-3 text-left">Cuenta</th>
                  <th className="p-3 text-right">Monto</th>
                  <th className="p-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                      <p className="mt-2 text-gray-500">Cargando ingresos...</p>
                    </td>
                  </tr>
                ) : ingresos.length > 0 ? (
                  ingresos.map((ingreso, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-3">{formatDate(ingreso.fecha)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          ingreso.tipo === 'Venta' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {ingreso.tipo}
                        </span>
                      </td>
                      <td className="p-3">{ingreso.referencia || '-'}</td>
                      <td className="p-3">{ingreso.descripcion || ingreso.origen || '-'}</td>
                      <td className="p-3">{ingreso.cuenta || '-'}</td>
                      <td className="p-3 text-right font-semibold text-green-600">
                        {formatCurrency(ingreso.monto)}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center space-x-2">
                          <button 
                            onClick={() => verDetalle(ingreso.referencia, ingreso.tipo)}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded"
                            title="Ver Detalle"
                            >
                            <MdRemoveRedEye size={20} />
                            </button>

                            {/* Por esta: */}
                            <button 
                            onClick={() => {
                                // Para ventas, usa referencia; para ingresos usa id
                                const idAConsultar = ingreso.tipo === 'Venta' ? ingreso.referencia : ingreso.id;
                                verDetalle(idAConsultar, ingreso.tipo);
                            }}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded"
                            title="Ver Detalle"
                            >
                            <MdRemoveRedEye size={20} />
                            </button>
                          <button 
                            onClick={() => imprimirIngreso(ingreso)}
                            className="bg-purple-500 hover:bg-purple-600 text-white p-1 rounded"
                            title="Imprimir"
                          >
                            <MdPrint size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-4 text-center text-gray-500">
                      No hay ingresos registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Vista móvil */}
          <div className="md:hidden">
            {cargando ? (
              <div className="p-8 text-center">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
                <p className="mt-2 text-gray-500">Cargando ingresos...</p>
              </div>
            ) : ingresos.length > 0 ? (
              <div className="divide-y">
                {ingresos.map((ingreso, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        ingreso.tipo === 'Venta' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {ingreso.tipo}
                      </span>
                      <span className="text-right font-semibold text-green-600">
                        {formatCurrency(ingreso.monto)}
                      </span>
                    </div>
                    <div className="mb-2">
                      <p className="text-gray-500 text-sm">{formatDate(ingreso.fecha)}</p>
                      <p className="font-medium">{ingreso.descripcion || ingreso.origen || '-'}</p>
                      <p>Cuenta: {ingreso.cuenta || '-'}</p>
                      {ingreso.referencia && <p>Ref: {ingreso.referencia}</p>}
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => verDetalle(ingreso.referencia, ingreso.tipo)}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded"
                        title="Ver Detalle"
                      >
                        <MdRemoveRedEye size={20} />
                      </button>
                      <button 
                        onClick={() => imprimirIngreso(ingreso)}
                        className="bg-purple-500 hover:bg-purple-600 text-white p-1 rounded"
                        title="Imprimir"
                      >
                        <MdPrint size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                No hay ingresos registrados
              </div>
            )}
          </div>
          
          {/* Paginación */}
          {ingresos.length > 0 && (
            <div className="bg-gray-50 p-4 border-t flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <span className="mr-2">Mostrar</span>
                <select 
                  className="border rounded px-2 py-1"
                  value={registrosPorPagina}
                  onChange={(e) => {
                    setRegistrosPorPagina(Number(e.target.value));
                    setPaginaActual(1);
                    cargarIngresos(1);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="ml-2">por página</span>
              </div>
              
              <div className="flex items-center">
                <span className="mr-4 hidden md:inline">
                  Mostrando {Math.min(totalRegistros, (paginaActual - 1) * registrosPorPagina + 1)} a {Math.min(paginaActual * registrosPorPagina, totalRegistros)} de {totalRegistros} registros
                </span>
                
                <div className="flex">
                  <button 
                    onClick={() => cambiarPagina(1)}
                    disabled={paginaActual === 1}
                    className={`px-3 py-1 border rounded-l ${paginaActual === 1 ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-100'}`}
                  >
                    ⟪
                  </button>
                  <button 
                    onClick={() => cambiarPagina(paginaActual - 1)}
                    disabled={paginaActual === 1}
                    className={`px-3 py-1 border-t border-b ${paginaActual === 1 ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-100'}`}
                  >
                    ⟨
                  </button>
                  
                  {/* Botones de página */}
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                    .filter(num => 
                      num === 1 || 
                      num === totalPaginas || 
                      (num >= paginaActual - 1 && num <= paginaActual + 1)
                    )
                    .map((numero, index, array) => {
                      const mostrarPuntosSuspensivos = index > 0 && numero - array[index - 1] > 1;
                      
                      return (
                        <Fragment key={numero}>
                          {mostrarPuntosSuspensivos && (
                            <span className="px-3 py-1 border-t border-b">...</span>
                          )}
                          <button 
                            onClick={() => cambiarPagina(numero)}
                            className={`px-3 py-1 border-t border-b ${
                              paginaActual === numero ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                            }`}
                          >
                            {numero}
                          </button>
                        </Fragment>
                      );
                    })
                  }
                  
                  <button 
                    onClick={() => cambiarPagina(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                    className={`px-3 py-1 border-t border-b ${paginaActual === totalPaginas ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-100'}`}
                  >
                    ⟩
                  </button>
                  <button 
                    onClick={() => cambiarPagina(totalPaginas)}
                    disabled={paginaActual === totalPaginas}
                    className={`px-3 py-1 border rounded-r ${paginaActual === totalPaginas ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-100'}`}
                  >
                    ⟫
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal para nuevo ingreso */}
      {mostrarModalNuevoIngreso && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Registrar Nuevo Ingreso</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cuenta</label>
              <select
                className="w-full p-2 border rounded"
                value={nuevoIngreso.cuenta_id}
                onChange={(e) => setNuevoIngreso({...nuevoIngreso, cuenta_id: e.target.value})}
              >
                <option value="">Seleccionar cuenta</option>
                {cuentas.map((cuenta, index) => (
                  <option key={index} value={index + 1}>{cuenta}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
              <input
                type="number"
                step="0.01"
                className="w-full p-2 border rounded"
                value={nuevoIngreso.monto}
                onChange={(e) => setNuevoIngreso({...nuevoIngreso, monto: e.target.value})}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Origen</label>
              <select
                className="w-full p-2 border rounded"
                value={nuevoIngreso.origen}
                onChange={(e) => setNuevoIngreso({...nuevoIngreso, origen: e.target.value})}
              >
                <option value="ingreso manual">Ingreso Manual</option>
                <option value="cobro">Cobro de Deuda</option>
                <option value="reintegro">Reintegro</option>
                <option value="ajuste">Ajuste</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
              <textarea
                className="w-full p-2 border rounded"
                rows="3"
                value={nuevoIngreso.descripcion}
                onChange={(e) => setNuevoIngreso({...nuevoIngreso, descripcion: e.target.value})}
                placeholder="Añadir una descripción..."
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setMostrarModalNuevoIngreso(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={registrarNuevoIngreso}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Registrar Ingreso
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de detalle */}
      {mostrarModalDetalle && detalleData && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-center">
              Detalle de {tipoDetalle === 'venta' ? 'Venta' : 'Ingreso'}
            </h2>
            
            {tipoDetalle === 'venta' && (
              <div>
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div>
                      <p><strong>Fecha:</strong> {formatDate(detalleData.venta.fecha)}</p>
                      <p><strong>Cliente:</strong> {detalleData.venta.cliente_nombre}</p>
                      {detalleData.venta.cliente_documento && (
                        <p><strong>Documento:</strong> {detalleData.venta.cliente_documento}</p>
                      )}
                    </div>
                    <div className="mt-4 md:mt-0">
                      <p><strong>Factura:</strong> {detalleData.venta.factura || 'No especificado'}</p>
                      <p><strong>Estado:</strong> {detalleData.venta.estado}</p>
                      <p className="text-lg font-bold text-green-700">
                        <strong>Total:</strong> {formatCurrency(detalleData.venta.total)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <h3 className="font-bold text-lg mb-2">Productos</h3>
                <div className="overflow-x-auto bg-white rounded shadow mb-4">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2">Producto</th>
                        <th className="p-2">Cantidad</th>
                        <th className="p-2">Precio</th>
                        <th className="p-2">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalleData.productos && detalleData.productos.length > 0 ? (
                        detalleData.productos.map((producto, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">{producto.producto_nombre}</td>
                            <td className="p-2 text-center">{producto.cantidad} {producto.unidad_medida}</td>
                            <td className="p-2 text-right">{formatCurrency(producto.precio_unitario)}</td>
                            <td className="p-2 text-right">{formatCurrency(producto.subtotal)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="p-4 text-center text-gray-500">
                            No hay productos en esta venta
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan="3" className="p-2 text-right font-bold">Total:</td>
                        <td className="p-2 text-right font-bold">{formatCurrency(detalleData.venta.total)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
            
            {tipoDetalle === 'ingreso' && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between">
                    <span className="font-semibold">ID:</span>
                    <span>{detalleData.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Fecha:</span>
                    <span>{formatDate(detalleData.fecha)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Origen:</span>
                    <span>{detalleData.origen}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Referencia:</span>
                    <span>{detalleData.referencia_id || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Cuenta:</span>
                    <span>{detalleData.cuenta_nombre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Monto:</span>
                    <span className="font-bold text-green-700">{formatCurrency(detalleData.monto)}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => imprimirIngreso(detalleData)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded mr-2"
              >
                Imprimir
              </button>
              <button
                onClick={() => setMostrarModalDetalle(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
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