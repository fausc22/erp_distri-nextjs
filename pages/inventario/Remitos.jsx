import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import Head from 'next/head';
import useAuth from '../../hooks/useAuth';

export default function HistorialRemitos() {
  const [remitos, setRemitos] = useState([]); // Estado para almacenar todos los remitos
  const [remitosFiltered, setRemitosFiltered] = useState([]); // Estado para almacenar remitos filtrados
  const [selectedRemito, setSelectedRemito] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [remitoProductos, setRemitoProductos] = useState([]);
  const [filtroCliente, setFiltroCliente] = useState(''); // Estado para el filtro de cliente
  
  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(5);
  
  useAuth();
  
  useEffect(() => {
    document.title = 'VERTIMAR | Remitos';
    fetchRemitos();
  }, []);
  
  // Efecto para filtrar remitos cuando cambia el filtro o los remitos
  useEffect(() => {
    filtrarRemitos();
  }, [filtroCliente, remitos]);
  
  const fetchRemitos = async () => {
    try {
      const response = await axios.get("http://localhost:3001/productos/obtener-remitos");
      setRemitos(response.data);
      setRemitosFiltered(response.data); // Inicialmente, mostrar todos los remitos
    } catch (error) {
      console.error("Error al obtener remitos:", error);
      toast.error("No se pudieron cargar los remitos");
    }
  };

  // Función para filtrar remitos por cliente
  const filtrarRemitos = () => {
    if (!filtroCliente.trim()) {
      // Si no hay filtro, mostrar todos los remitos
      setRemitosFiltered(remitos);
    } else {
      // Filtrar remitos por nombre de cliente (insensible a mayúsculas/minúsculas)
      const filtrados = remitos.filter(remito => 
        remito.cliente_nombre.toLowerCase().includes(filtroCliente.toLowerCase())
      );
      setRemitosFiltered(filtrados);
      // Resetear a la primera página cuando se aplica un filtro
      setPaginaActual(1);
    }
  };

  // Manejar cambio en el campo de filtro
  const handleFiltroChange = (e) => {
    setFiltroCliente(e.target.value);
  };

  // Limpiar filtro
  const limpiarFiltro = () => {
    setFiltroCliente('');
  };

  const handleRowDoubleClick = async (remito) => {
    setSelectedRemito(remito);
    setModalIsOpen(true);

    try {
      const response = await axios.get(`http://localhost:3001/productos/obtener-productos-remito/${remito.id}`);
      setRemitoProductos(response.data);
    } catch (error) {
      console.error("Error al obtener productos del remito:", error);
      toast.error("No se pudieron cargar los productos del remito");
    }
  };

  const generarPdf = async () => {
    if (!selectedRemito || remitoProductos.length === 0) {
      toast.error("Seleccione un cliente y al menos un producto");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3001/productos/generarpdf-remito",
        {
          remito: selectedRemito,
          productos: remitoProductos,
        },
        { responseType: "blob" }
      );

      // Crear un link para descargar el PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `REMITO_${selectedRemito.cliente_nombre}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      toast.error("Error al generar el PDF");
    }
  };
  
  // Calcular índices para mostrar solo los registros de la página actual
  const indexOfUltimoRegistro = paginaActual * registrosPorPagina;
  const indexOfPrimerRegistro = indexOfUltimoRegistro - registrosPorPagina;
  const remitosActuales = remitosFiltered.slice(indexOfPrimerRegistro, indexOfUltimoRegistro);

  // Calcular el número total de páginas
  const totalPaginas = Math.ceil(remitosFiltered.length / registrosPorPagina);
  
  // Función para cambiar de página
  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Head>
        <title>VERTIMAR | Remitos</title>
        <meta name="description" content="Historial de remitos en el sistema VERTIMAR" />
      </Head>
      
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-6xl">
        <h1 className="text-2xl font-bold mb-4 text-center">HISTORIAL DE REMITOS</h1>
        
        {/* Filtro por cliente */}
        <div className="mb-4">
          <div className="flex">
            <input
              type="text"
              placeholder="Filtrar por cliente..."
              className="rounded-l-md border border-gray-300 p-2 flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filtroCliente}
              onChange={handleFiltroChange}
            />
            {filtroCliente && (
              <button
                onClick={limpiarFiltro}
                className="bg-gray-200 hover:bg-gray-300 px-3 border-t border-b border-r border-gray-300"
                title="Limpiar filtro"
              >
                ✕
              </button>
            )}
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md"
            >
              Filtrar
            </button>
          </div>
          {remitosFiltered.length < remitos.length && (
            <div className="mt-2 text-sm text-gray-600">
              Mostrando {remitosFiltered.length} de {remitos.length} remitos.
              {remitosFiltered.length === 0 && (
                <button
                  onClick={limpiarFiltro}
                  className="ml-2 text-blue-600 hover:text-blue-800 underline"
                >
                  Mostrar todos
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Vista de escritorio para la tabla de remitos */}
        <div className="hidden md:block overflow-x-auto bg-white rounded shadow text-black">
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2">Cod.</th>
                <th className="p-2">Fecha</th>
                <th className="p-2">Cliente</th>
                <th className="p-2">Condición</th>
                <th className="p-2">CUIT</th>
                <th className="p-2">Teléfono</th>
                <th className="p-2">Dirección</th>
                <th className="p-2">Ciudad</th>
                <th className="p-2">Provincia</th>
                <th className="p-2">Estado</th>
                <th className="p-2">Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {remitosActuales.length > 0 ? (
                remitosActuales.map((remito) => (
                  <tr 
                    key={remito.id} 
                    className="hover:bg-gray-100 cursor-pointer"
                    onDoubleClick={() => handleRowDoubleClick(remito)}
                  >
                    <td className="p-2">{remito.id}</td>
                    <td className="p-2">{remito.fecha}</td>
                    <td className="p-2">{remito.cliente_nombre}</td>
                    <td className="p-2">{remito.cliente_condicion}</td>
                    <td className="p-2">{remito.cliente_cuit}</td>
                    <td className="p-2">{remito.cliente_telefono}</td>
                    <td className="p-2">{remito.cliente_direccion}</td>
                    <td className="p-2">{remito.cliente_ciudad}</td>
                    <td className="p-2">{remito.cliente_provincia}</td>
                    <td className="p-2">{remito.estado}</td>
                    <td className="p-2">{remito.observaciones}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="p-4 text-center text-gray-500">
                    {filtroCliente ? "No se encontraron remitos para este cliente" : "No hay remitos disponibles"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {/* Paginador */}
          {remitosFiltered.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t">
              <div className="flex items-center">
                <span className="mr-2">Mostrar</span>
                <select 
                  className="border rounded px-2 py-1"
                  value={registrosPorPagina}
                  onChange={(e) => {
                    setRegistrosPorPagina(Number(e.target.value));
                    setPaginaActual(1); // Volver a la primera página al cambiar los registros por página
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="ml-2">registros por página</span>
              </div>
              
              <div className="flex items-center">
                <span className="mr-4">
                  Mostrando {indexOfPrimerRegistro + 1} a {Math.min(indexOfUltimoRegistro, remitosFiltered.length)} de {remitosFiltered.length} registros
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
                  
                  {/* Generar botones de página */}
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                    .filter(num => 
                      num === 1 || 
                      num === totalPaginas || 
                      (num >= paginaActual - 1 && num <= paginaActual + 1)
                    )
                    .map((numero, index, array) => {
                      // Insertar puntos suspensivos si hay saltos
                      const mostrarPuntosSuspensivos = index > 0 && numero - array[index - 1] > 1;
                      
                      return (
                        <div key={numero}>
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
                        </div>
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
        
        {/* Vista móvil para la tabla de remitos */}
        <div className="md:hidden space-y-4">
          {remitosActuales.length > 0 ? (
            remitosActuales.map((remito) => (
              <div 
                key={remito.id} 
                className="bg-white p-4 rounded shadow hover:bg-gray-50 cursor-pointer"
                onClick={() => handleRowDoubleClick(remito)}
              >
                <div className="flex justify-between">
                  <span className="font-bold">Cod.:</span>
                  <span>{remito.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Fecha:</span>
                  <span>{remito.fecha}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Cliente:</span>
                  <span>{remito.cliente_nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">CUIT:</span>
                  <span>{remito.cliente_cuit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Ciudad:</span>
                  <span>{remito.cliente_ciudad}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Estado:</span>
                  <span>{remito.estado}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500 bg-white rounded shadow">
              {filtroCliente ? "No se encontraron remitos para este cliente" : "No hay remitos disponibles"}
            </div>
          )}
          
          {/* Paginador para móvil (simplificado) */}
          {remitosFiltered.length > 0 && (
            <div className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-center">
                <button 
                  onClick={() => cambiarPagina(paginaActual - 1)}
                  disabled={paginaActual === 1}
                  className={`px-3 py-1 rounded ${paginaActual === 1 ? 'bg-gray-100 text-gray-400' : 'bg-blue-500 text-white'}`}
                >
                  Anterior
                </button>
                
                <span>
                  Página {paginaActual} de {totalPaginas}
                </span>
                
                <button 
                  onClick={() => cambiarPagina(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas}
                  className={`px-3 py-1 rounded ${paginaActual === totalPaginas ? 'bg-gray-100 text-gray-400' : 'bg-blue-500 text-white'}`}
                >
                  Siguiente
                </button>
              </div>
              
              <div className="mt-2">
                <select 
                  className="border rounded w-full p-2"
                  value={registrosPorPagina}
                  onChange={(e) => {
                    setRegistrosPorPagina(Number(e.target.value));
                    setPaginaActual(1);
                  }}
                >
                  <option value={5}>5 por página</option>
                  <option value={10}>10 por página</option>
                  <option value={20}>20 por página</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal de detalle de remito */}
      {selectedRemito && modalIsOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-center">Detalles del Remito</h2>
            <h4 className="mt-2"><strong>Fecha:</strong> {selectedRemito.fecha}</h4>
            
            <div className="flex flex-col md:flex-row justify-between gap-4 mt-4">
              {/* Información del Cliente (Izquierda) */}
              <div className="w-full md:w-1/2">
                <h3 className="font-bold mb-2">Información del Cliente</h3>
                <p><strong>Cliente:</strong> {selectedRemito.cliente_nombre}</p>
                <p><strong>Dirección:</strong> {selectedRemito.cliente_direccion}</p>
                <p><strong>Ciudad:</strong> {selectedRemito.cliente_ciudad}</p>
                <p><strong>Provincia:</strong> {selectedRemito.cliente_provincia}</p>
                <p><strong>Condición IVA:</strong> {selectedRemito.cliente_condicion}</p>
                <p><strong>CUIT:</strong> {selectedRemito.cliente_cuit}</p>
              </div>
              
              {/* Información del Documento y Totales (Derecha) */}
              <div className="w-full md:w-1/2">
                <h3 className="font-bold mb-2">Información del Documento</h3>
                <p><strong>ESTADO:</strong> {selectedRemito.estado}</p>
                <p><strong>OBSERVACIONES:</strong> {selectedRemito.observaciones || "Sin observaciones"}</p>
              </div>
            </div>
            
            {/* Sección de productos */}
            <div className="mt-6">
              <h3 className="font-bold text-center mb-4">Productos</h3>
              
              <div className="overflow-x-auto bg-white rounded shadow">
                <table className="w-full">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="p-2">Código</th>
                      <th className="p-2">Nombre</th>
                      <th className="p-2">Unidad Medida</th>
                      <th className="p-2">Cantidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {remitoProductos.length > 0 ? (
                      remitoProductos.map((producto) => (
                        <tr key={producto.id} className="hover:bg-gray-100">
                          <td className="p-2">{producto.producto_id}</td>
                          <td className="p-2">{producto.producto_nombre}</td>
                          <td className="p-2">{producto.producto_um}</td>
                          <td className="p-2">{producto.cantidad}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="p-4 text-center text-gray-500">
                          No hay productos en este remito
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="flex justify-center gap-4 mt-6">
              <button 
                onClick={generarPdf}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
              >
                IMPRIMIR REMITO
              </button>
              <button 
                className="bg-cyan-500 hover:bg-cyan-600 text-black px-4 py-2 rounded"
              >
                VER DETALLE VENTA
              </button>
            </div>
            
            <button 
              onClick={() => setModalIsOpen(false)}
              className="mt-4 w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
      
      <Toaster />
    </div>
  );
}