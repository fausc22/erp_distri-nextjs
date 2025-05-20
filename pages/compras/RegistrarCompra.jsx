import { useState, useEffect } from 'react';
import { MdSearch, MdDeleteForever, MdCloudUpload, MdRemoveRedEye } from "react-icons/md";
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import Head from 'next/head';
import useAuth from '../../hooks/useAuth';

export default function RegistrarCompra() {
  // Estados para gestionar proveedores
  const [proveedorInput, setProveedorInput] = useState('');
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [resultadosProveedores, setResultadosProveedores] = useState([]);
  const [mostrarModalProveedor, setMostrarModalProveedor] = useState(false);
  
  // Estados para gestionar productos
  const [productoInput, setProductoInput] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [resultadosProductos, setResultadosProductos] = useState([]);
  const [mostrarModalProducto, setMostrarModalProducto] = useState(false);
  
  // Estados para la compra
  const [productos, setProductos] = useState([]);
  const [cantidad, setCantidad] = useState(1);
  const [precioCosto, setPrecioCosto] = useState(0);
  const [precioVenta, setPrecioVenta] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  

  
  // Modal de confirmaciones
  const [mostrarConfirmacionSalida, setMostrarConfirmacionSalida] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  
  // Validación de autenticación
  useAuth();
  
  // Buscar proveedor
const buscarProveedor = async () => {
  if (!proveedorInput.trim()) {
    toast.error('Ingrese un nombre para buscar');
    return;
  }

  try {
    const res = await fetch(`http://localhost:3001/personas/buscar-proveedor?search=${encodeURIComponent(proveedorInput)}`);
    if (!res.ok) throw new Error('Respuesta no OK del servidor');
    
    const data = await res.json();
    
    if (data.success) {
      setResultadosProveedores(data.data);
      if (data.data.length === 0) {
        toast.error('No se encontraron proveedores con ese nombre');
      } else {
        setMostrarModalProveedor(true);
      }
    } else {
      toast.error(data.message || 'Error al buscar proveedor');
    }
  } catch (error) {
    console.error('Error al buscar proveedor:', error);
    toast.error('Error al conectar con el servidor');
  }
};

  // Seleccionar proveedor
  const seleccionarProveedor = (proveedor) => {
    setProveedorSeleccionado(proveedor);
    setMostrarModalProveedor(false);
  };

  // Buscar producto
  const buscarProducto = async () => {
    if (!productoInput.trim()) return;

    try {
      const res = await fetch(`http://localhost:3001/productos/buscar-producto?search=${encodeURIComponent(productoInput)}`);
      if (!res.ok) throw new Error('Respuesta no OK del servidor');

      const data = await res.json();
      setResultadosProductos(data.data);
      setMostrarModalProducto(true);
    } catch (error) {
      console.error('Error al buscar producto:', error);
      toast.error('Error al buscar producto');
    }
  };

  // Seleccionar producto
  const seleccionarProducto = (producto) => {
    if (!productoSeleccionado || productoSeleccionado.id !== producto.id) {
      setProductoSeleccionado(producto);
      setMostrarModalProducto(false);
      setCantidad(1);
      setPrecioCosto(producto.costo || 0);
      setPrecioVenta(producto.precio || 0);
      calcularSubtotal(1, producto.costo || 0);
    }
  };
  
  // Calcular subtotal
  const calcularSubtotal = (cant = cantidad, costo = precioCosto) => {
    const subtotalCalculado = parseFloat(Number(cant * costo).toFixed(2));
    setSubtotal(subtotalCalculado);
  };

  // Agregar producto a la lista
  const agregarProducto = () => {
    if (!productoSeleccionado) {
      toast.error('Debe seleccionar un producto');
      return;
    }
    
    if (precioCosto <= 0) {
      toast.error('El precio de costo debe ser mayor a 0');
      return;
    }
    
    if (precioVenta <= 0) {
      toast.error('El precio de venta debe ser mayor a 0');
      return;
    }
    
    if (cantidad <= 0) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }
    
    const nuevoProducto = {
      id: productoSeleccionado.id,
      nombre: productoSeleccionado.nombre,
      unidad_medida: productoSeleccionado.unidad_medida,
      cantidad: cantidad,
      precio_costo: parseFloat(precioCosto),
      precio_venta: parseFloat(precioVenta),
      subtotal: subtotal
    };
    
    setProductos([...productos, nuevoProducto]);
    
    // Limpiar selección y cerrar modal
    setProductoSeleccionado(null);
    setMostrarModalProducto(false);
    setProductoInput('');
    setCantidad(1);
    setPrecioCosto(0);
    setPrecioVenta(0);
    setSubtotal(0);
  };

  // Eliminar producto de la lista
  const eliminarProducto = (index) => {
    const nuevoListado = [...productos];
    nuevoListado.splice(index, 1);
    setProductos(nuevoListado);
  };
  
  // Actualizar cantidad de producto en la lista
  const actualizarCantidadProducto = (index, nuevaCantidad) => {
    nuevaCantidad = Math.max(1, nuevaCantidad);
    
    const productosActualizados = [...productos];
    productosActualizados[index].cantidad = nuevaCantidad;
    productosActualizados[index].subtotal = parseFloat((productosActualizados[index].precio_costo * nuevaCantidad).toFixed(2));
    
    setProductos(productosActualizados);
  };

 

  // Actualizar el total cuando cambian los productos
  useEffect(() => {
    const nuevoTotal = productos.reduce((acc, prod) => acc + prod.subtotal, 0);
    setTotal(parseFloat(Number(nuevoTotal).toFixed(2)));
  }, [productos]);

  // Función para confirmar la compra
  const confirmarCompra = () => {
    if (!proveedorSeleccionado) {
      toast.error('Debe seleccionar un proveedor');
      return;
    }
    
    if (productos.length === 0) {
      toast.error('Debe agregar al menos un producto');
      return;
    }
    
    setMostrarConfirmacion(true);
  };

  // Función para registrar la compra en el servidor
  const handleRegistrarCompra = async () => {
    if (!proveedorSeleccionado || productos.length === 0) {
      toast.error('Debe seleccionar un proveedor y agregar al menos un producto');
      return;
    }

    try {
      // Primero crear la compra
      const compraData = {
        proveedor_id: proveedorSeleccionado.id,
        proveedor_nombre: proveedorSeleccionado.nombre,
        proveedor_cuit: proveedorSeleccionado.cuit,
        total: total.toFixed(2),
        fecha: new Date().toISOString().slice(0, 10),
        productos: productos
      };

      const response = await axios.post('http://localhost:3001/compras/registrarCompra', compraData);
      
      if (response.data.success) {
        const compraId = response.data.compraId;
        
        
        
        toast.success('Compra registrada con éxito');
        
        // Limpiar formulario
        setProveedorSeleccionado(null);
        setProveedorInput('');
        setProductos([]);
        
        setTotal(0);
      } else {
        toast.error(response.data.message || 'Error al registrar la compra');
      }
    } catch (error) {
      console.error('Error al registrar la compra:', error);
      toast.error('Error al registrar la compra');
    } finally {
      setMostrarConfirmacion(false);
    }
  };

  // Función para manejar el intento de salir
  const confirmarSalida = () => {
    if (proveedorSeleccionado || productos.length > 0) {
      setMostrarConfirmacionSalida(true);
    } else {
      window.location.href = '/';
    }
  };

  // Formateador de moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(value);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Head>
        <title>VERTIMAR | Registrar Compra</title>
        <meta name="description" content="Registro de compras a proveedores" />
      </Head>
      
      <div className="w-full max-w-6xl bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Encabezado */}
        <div className="bg-green-800 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">REGISTRAR COMPRA</h1>
          <p className="text-green-200 mt-2">Ingrese los datos de la compra a proveedor</p>
        </div>
        
        <div className="p-6">
          {/* Sección superior: Proveedor y Productos */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            {/* Lado izquierdo: Proveedor */}
            <div className="bg-green-900 text-white p-6 rounded-lg flex-1 min-w-[300px]">
              <h2 className="text-2xl font-semibold mb-4 text-center">Proveedor</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Nombre del proveedor"
                    value={proveedorSeleccionado ? proveedorSeleccionado.nombre : proveedorInput}
                    onChange={(e) => setProveedorInput(e.target.value)}
                    disabled={!!proveedorSeleccionado}
                    className="w-full p-2 rounded text-black"
                  />
                  <button
                    onClick={buscarProveedor}
                    disabled={!!proveedorSeleccionado}
                    className="p-2 rounded bg-white text-green-900 hover:bg-green-100 transition"
                    title="Buscar proveedor"
                  >
                    <MdSearch size={24} />
                  </button>
                  {proveedorSeleccionado && (
                    <button
                      onClick={() => {
                        setProveedorSeleccionado(null);
                        setProveedorInput('');
                      }}
                      className="p-2 rounded bg-white text-red-600 hover:bg-red-100 transition"
                      title="Eliminar proveedor"
                    >
                      <MdDeleteForever size={24} />
                    </button>
                  )}
                </div>
              </div>

              {/* Detalles del proveedor seleccionado */}
              {proveedorSeleccionado && (
                <div className="bg-green-800 p-4 rounded mt-4 text-sm space-y-1">
                  <p><strong>Nombre:</strong> {proveedorSeleccionado.nombre || '-'}</p>
                  <p><strong>CUIT:</strong> {proveedorSeleccionado.cuit || '-'}</p>
                  <p><strong>Dirección:</strong> {proveedorSeleccionado.direccion || '-'}</p>
                  <p><strong>Teléfono:</strong> {proveedorSeleccionado.telefono || '-'}</p>
                  <p><strong>Email:</strong> {proveedorSeleccionado.email || '-'}</p>
                </div>
              )}
            </div>

            
            
          </div>
          
          {/* Sección de búsqueda de productos */}
          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">Agregar Productos</h2>
            
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex-1 min-w-[250px]">
                <label htmlFor="producto" className="block text-sm font-medium text-gray-700 mb-2">
                  Producto
                </label>
                <div className="flex gap-2">
                  <input
                    id="producto"
                    type="text"
                    placeholder="Buscar producto"
                    className="w-full p-2 rounded border border-gray-300"
                    value={productoInput}
                    onChange={(e) => setProductoInput(e.target.value)}
                  />
                  <button
                    onClick={buscarProducto}
                    className="p-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                    title="Buscar producto"
                  >
                    <MdSearch size={24} />
                  </button>
                </div>
              </div>
              
              {productoSeleccionado && (
                <>
                  <div className="w-full md:w-auto">
                    <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700 mb-2">
                      Cantidad
                    </label>
                    <input
                      id="cantidad"
                      type="number"
                      min="1"
                      value={cantidad}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        setCantidad(value);
                        calcularSubtotal(value, precioCosto);
                      }}
                      className="w-24 p-2 rounded border border-gray-300"
                    />
                  </div>
                  
                  <div className="w-full md:w-auto">
                    <label htmlFor="precioCosto" className="block text-sm font-medium text-gray-700 mb-2">
                      Precio Costo ($)
                    </label>
                    <input
                      id="precioCosto"
                      type="number"
                      min="0"
                      step="0.01"
                      value={precioCosto}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        setPrecioCosto(value);
                        calcularSubtotal(cantidad, value);
                      }}
                      className="w-32 p-2 rounded border border-gray-300"
                    />
                  </div>
                  
                  <div className="w-full md:w-auto">
                    <label htmlFor="precioVenta" className="block text-sm font-medium text-gray-700 mb-2">
                      Precio Venta ($)
                    </label>
                    <input
                      id="precioVenta"
                      type="number"
                      min="0"
                      step="0.01"
                      value={precioVenta}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        setPrecioVenta(value);
                      }}
                      className="w-32 p-2 rounded border border-gray-300"
                    />
                  </div>
                </>
              )}
            </div>
            
            {productoSeleccionado && (
              <div className="flex flex-wrap justify-between items-center mt-4">
                <div className="bg-green-100 p-3 rounded">
                  <p className="font-medium">{productoSeleccionado.nombre}</p>
                  <p className="text-sm">Unidad: {productoSeleccionado.unidad_medida || '-'}</p>
                </div>
                
                <div className="space-x-4">
                  <span className="text-lg font-bold">
                    Subtotal: {formatCurrency(subtotal)}
                  </span>
                  
                  <button
                    onClick={agregarProducto}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                  >
                    Agregar Producto
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Tabla de productos */}
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-2">Productos Seleccionados</h3>
            
            {/* Vista de escritorio */}
            <div className="hidden md:block overflow-x-auto bg-white rounded shadow text-black">
              <table className="w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-2">Producto</th>
                    <th className="p-2">Unidad</th>
                    <th className="p-2">Cantidad</th>
                    <th className="p-2">Precio Costo</th>
                    <th className="p-2">Precio Venta</th>
                    <th className="p-2">Subtotal</th>
                    <th className="p-2">Eliminar</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.length > 0 ? (
                    productos.map((prod, idx) => (
                      <tr key={idx} className="text-center">
                        <td className="p-2">{prod.nombre}</td>
                        <td className="p-2">{prod.unidad_medida || '-'}</td>
                        <td className="p-2">
                          <div className="flex items-center justify-center space-x-2">
                            <button 
                              className="bg-gray-300 hover:bg-gray-400 text-black w-6 h-6 rounded flex items-center justify-center"
                              onClick={() => actualizarCantidadProducto(idx, prod.cantidad - 1)}
                            >
                              -
                            </button>
                            <span>{prod.cantidad}</span>
                            <button 
                              className="bg-gray-300 hover:bg-gray-400 text-black w-6 h-6 rounded flex items-center justify-center"
                              onClick={() => actualizarCantidadProducto(idx, prod.cantidad + 1)}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="p-2">{formatCurrency(prod.precio_costo)}</td>
                        <td className="p-2">{formatCurrency(prod.precio_venta)}</td>
                        <td className="p-2">{formatCurrency(prod.subtotal)}</td>
                        <td className="p-2">
                          <button
                            className="bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded"
                            onClick={() => eliminarProducto(idx)}
                          >
                            X
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="p-4 text-center text-gray-500">
                        No hay productos agregados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Vista móvil (tarjetas) */}
            <div className="md:hidden space-y-4">
              {productos.length > 0 ? (
                productos.map((prod, idx) => (
                  <div key={idx} className="bg-white p-4 rounded shadow">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold">{prod.nombre}</h4>
                      <button
                        className="bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded"
                        onClick={() => eliminarProducto(idx)}
                      >
                        X
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <span className="text-gray-600">Unidad:</span>
                        <span className="ml-2">{prod.unidad_medida || '-'}</span>
                      </div>
                      
                      <div>
                        <span className="text-gray-600">Cantidad:</span>
                        <div className="flex items-center space-x-2 mt-1">
                          <button 
                            className="bg-gray-300 hover:bg-gray-400 text-black w-6 h-6 rounded flex items-center justify-center"
                            onClick={() => actualizarCantidadProducto(idx, prod.cantidad - 1)}
                          >
                            -
                          </button>
                          <span className="font-medium">{prod.cantidad}</span>
                          <button 
                            className="bg-gray-300 hover:bg-gray-400 text-black w-6 h-6 rounded flex items-center justify-center"
                            onClick={() => actualizarCantidadProducto(idx, prod.cantidad + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-gray-600">Precio Costo:</span>
                        <span className="ml-2">{formatCurrency(prod.precio_costo)}</span>
                      </div>
                      
                      <div>
                        <span className="text-gray-600">Precio Venta:</span>
                        <span className="ml-2">{formatCurrency(prod.precio_venta)}</span>
                      </div>
                      
                      <div className="col-span-2">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="ml-2 font-bold">{formatCurrency(prod.subtotal)}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white p-4 rounded shadow text-center text-gray-500">
                  No hay productos agregados
                </div>
              )}
            </div>
          </div>
          
          {/* Total de la compra */}
          {productos.length > 0 && (
            <div className="mt-6 flex justify-end">
              <div className="bg-green-100 text-green-800 text-2xl font-bold p-4 rounded shadow-lg">
                Total: {formatCurrency(total)}
              </div>
            </div>
          )}
          
          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row justify-end mt-6 gap-4">
            <button 
              className="bg-green-600 hover:bg-green-800 px-6 py-2 rounded text-white font-semibold"
              onClick={confirmarCompra}
            >
              Confirmar Compra
            </button>
            <button 
              className="bg-red-600 hover:bg-red-800 px-6 py-2 rounded text-white font-semibold"
              onClick={confirmarSalida}
            >
              Volver al Menú
            </button>
          </div>
        </div>
      </div>
      
      {/* Modal de resultados proveedor */}
      {mostrarModalProveedor && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg p-4 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Seleccionar Proveedor</h3>
            <ul className="max-h-60 overflow-y-auto">
              {resultadosProveedores.length > 0 ? (
                resultadosProveedores.map((proveedor, idx) => (
                  <li
                    key={idx}
                    className="p-2 border-b hover:bg-gray-100 cursor-pointer"
                    onClick={() => seleccionarProveedor(proveedor)}
                  >
                    {proveedor.nombre}
                  </li>
                ))
              ) : (
                <li className="text-gray-500">No se encontraron resultados.</li>
              )}
            </ul>
            <button
              onClick={() => setMostrarModalProveedor(false)}
              className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal de resultados producto */}
      {mostrarModalProducto && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg p-4 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Seleccionar Producto</h3>
            <ul className="max-h-60 overflow-y-auto">
              {resultadosProductos.length > 0 ? (
                resultadosProductos.map((producto, idx) => (
                  <li
                    key={idx}
                    className="p-2 border-b hover:bg-gray-100 cursor-pointer"
                    onClick={() => seleccionarProducto(producto)}
                  >
                    <div className="font-medium">{producto.nombre}</div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Stock: {producto.stock_actual || 0} {producto.unidad_medida}</span>
                      <span>
                        Costo: {formatCurrency(producto.costo || 0)} | 
                        Venta: {formatCurrency(producto.precio || 0)}
                      </span>
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-gray-500">No se encontraron resultados.</li>
              )}
            </ul>
            <button
              onClick={() => setMostrarModalProducto(false)}
              className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
      
      {/* Modal de confirmación de compra */}
      {mostrarConfirmacion && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4 text-center">Confirmar Compra</h3>
            <div className="text-center mb-6">
              <p className="mb-2">¿Desea confirmar la compra al proveedor <span className="font-bold">{proveedorSeleccionado.nombre}</span> por un total de <span className="font-bold text-green-700">{formatCurrency(total)}</span>?</p>
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleRegistrarCompra}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold"
              >
                Sí, Confirmar
              </button>
              <button
                onClick={() => setMostrarConfirmacion(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded font-semibold"
              >
                No, Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de confirmación de salida */}
      {mostrarConfirmacionSalida && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4 text-center">¿Estás seguro que deseas salir?</h3>
            <div className="text-center mb-6">
              <p className="mb-2">Se perderán los datos no guardados.</p>
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => window.location.href = '/'}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold"
              >
                Sí, Salir
              </button>
              <button
                onClick={() => setMostrarConfirmacionSalida(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded font-semibold"
              >
                No, Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Toaster position="top-right" />
    </div>
  );
}