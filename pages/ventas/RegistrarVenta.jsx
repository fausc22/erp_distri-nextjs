import { useState, useEffect } from 'react';
import { MdSearch, MdDeleteForever } from "react-icons/md";
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Head from 'next/head';
import useAuth from '../../hooks/useAuth';


export default function RegistrarVenta() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [total, setTotal] = useState(0);

  const [clienteInput, setClienteInput] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [resultadosClientes, setResultadosClientes] = useState([]);
  const [mostrarModalCliente, setMostrarModalCliente] = useState(false);

  const [productoInput, setProductoInput] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [resultadosProductos, setResultadosProductos] = useState([]);
  const [mostrarModalProducto, setMostrarModalProducto] = useState(false);
  const [cantidad, setCantidad] = useState(1);
  const [subtotal, setSubtotal] = useState(0);
  const [mostrarConfirmacionSalida, setMostrarConfirmacionSalida] = useState(false);
  
  // Modal de confirmación de venta
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  useAuth();
  // Buscar clientes
  const buscarCliente = async () => {
    if (!clienteInput.trim()) return;

    try {
      const res = await fetch(`http://localhost:3001/ventas/filtrar-cliente?q=${encodeURIComponent(clienteInput)}`);
      if (!res.ok) throw new Error('Respuesta no OK del servidor');
      
      const data = await res.json();
      setResultadosClientes(data); // debería ser un array de clientes
      setMostrarModalCliente(true);
    } catch (error) {
      console.error('Error al buscar cliente:', error);
    }
  };

  // Seleccionar cliente
  const seleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setMostrarModalCliente(false);
  };

  // Buscar productos
  const buscarProducto = async () => {
    if (!productoInput.trim()) return;

    try {
      const res = await fetch(`http://localhost:3001/ventas/filtrar-producto?q=${encodeURIComponent(productoInput)}`);
      if (!res.ok) throw new Error('Respuesta no OK del servidor');

      const data = await res.json();
      setResultadosProductos(data); // debería ser un array de productos
      setMostrarModalProducto(true);
    } catch (error) {
      console.error('Error al buscar producto:', error);
    }
  };

  const seleccionarProducto = (producto) => {
    if (!productoSeleccionado || productoSeleccionado.id !== producto.id) {
      setProductoSeleccionado(producto);
      setCantidad(1);
      // Asegúrate de que producto.precio sea un número
      setSubtotal(parseFloat(Number(producto.precio).toFixed(2)));
    }
  };
  
  // Calcular subtotal con redondeo de 2 decimales
  const calcularSubtotal = () => {
    if (productoSeleccionado && cantidad > 0) {
      const subtotalCalculado = parseFloat(Number(productoSeleccionado.precio * cantidad).toFixed(2));
      setSubtotal(subtotalCalculado);
    }
  };

  const agregarProducto = () => {
    if (!productoSeleccionado) return;
    const nuevoProducto = {
      ...productoSeleccionado,
      cantidad,
      subtotal: parseFloat(Number(subtotal).toFixed(2)) // Asegúrate de que subtotal sea un número
    };
    setProductos((prevProductos) => {
      const nuevosProductos = [...prevProductos, nuevoProducto];
      return nuevosProductos;
    });
  
    // Limpiar selección y cerrar modal
    setProductoSeleccionado(null);
    setMostrarModalProducto(false);
    setProductoInput('');
  };

  // Eliminar producto
  const eliminarProducto = (index) => {
    const nuevoListado = [...productos];
    const eliminado = nuevoListado.splice(index, 1)[0];
    setProductos(nuevoListado);
    setTotal((prevTotal) => parseFloat((prevTotal - eliminado.subtotal).toFixed(2))); // Redondear el total
  };
  
  // Actualizar cantidad de producto
  const actualizarCantidadProducto = (index, nuevaCantidad) => {
    // Asegurar que la cantidad sea al menos 1
    nuevaCantidad = Math.max(1, nuevaCantidad);
    
    const productosActualizados = [...productos];
    const producto = productosActualizados[index];
    
    // Calcular el nuevo subtotal basado en la nueva cantidad
    const nuevoSubtotal = parseFloat((producto.precio * nuevaCantidad).toFixed(2));
    
    // Actualizar el producto
    productosActualizados[index] = {
      ...producto,
      cantidad: nuevaCantidad,
      subtotal: nuevoSubtotal
    };
    
    setProductos(productosActualizados);
  };

  // Actualizar el total cuando los productos cambian
  useEffect(() => {
    const nuevoTotal = productos.reduce((acc, prod) => acc + prod.subtotal, 0);
    
    // Verificar si nuevoTotal es un número válido
    if (isNaN(nuevoTotal)) {
      setTotal(0);  // En caso de que el cálculo sea incorrecto
    } else {
      setTotal(parseFloat(Number(nuevoTotal).toFixed(2))); // Redondear a dos decimales
    }
  }, [productos]);
  
  // Función para registrar la venta
  const handleRegistrarVenta = async () => {
    if (!clienteSeleccionado || productos.length === 0) {
      toast.error('Debe seleccionar un cliente y agregar al menos un producto.');
      return;
    }

    const ventaData = {
      cliente_id: clienteSeleccionado.id,
      cliente_nombre: clienteSeleccionado.nombre,
      cliente_telefono: clienteSeleccionado.telefono,
      cliente_direccion: clienteSeleccionado.direccion,
      cliente_ciudad: clienteSeleccionado.ciudad,
      cliente_provincia: clienteSeleccionado.provincia,
      cliente_condicion: clienteSeleccionado.condicion_iva,
      cliente_cuit: clienteSeleccionado.cuit,
      tipo_documento: 'Factura',
      tipo_fiscal: 'A',
      total: total.toFixed(2),
      estado: 'Registrada',
      empleado_id: 1,
      empleado_nombre: 'Fausto',
      productos: productos.map(p => ({
        id: p.id,
        nombre: p.nombre,
        unidad_medida: p.unidad_medida,
        cantidad: p.cantidad,
        precio: parseFloat(p.precio),
        iva: parseFloat(p.iva || 0),
        subtotal: parseFloat(p.subtotal)
      })),
    };

    console.log("Datos de la venta antes de enviarse:", ventaData);

    try {
      const response = await axios.post('http://localhost:3001/ventas/crear-venta', ventaData);
      toast.success('Venta registrada con éxito');
      setProductos([]);
      setTotal(0);
      setClienteSeleccionado(null);
      setClienteInput('');
    } catch (error) {
      console.error('Error al registrar la venta:', error);
      toast.error('Error al registrar la venta');
    }
  };

  // Función para mostrar el modal de confirmación
  const confirmarVenta = () => {
    if (!clienteSeleccionado) {
      toast.error('Debe seleccionar un cliente.');
      return;
    }
    
    if (productos.length === 0) {
      toast.error('Debe agregar al menos un producto.');
      return;
    }
    
    setMostrarConfirmacion(true);
  };

  // 2. Función para manejar el intento de salir
  const confirmarSalida = () => {
    // Verificar si hay datos que se perderían
    if (clienteSeleccionado || productos.length > 0) {
      setMostrarConfirmacionSalida(true);
    } else {
      // Si no hay datos, redirigir directamente
      window.location.href = '/';
    }
  };

  return (
    
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Head>
        <title>VERTIMAR | NUEVA VENTA</title>
        <meta name="description" content="Una descripción de mi página" />
        
      </Head>
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-6xl">
      <h1 className="text-2xl font-bold mb-4 text-center">NUEVA VENTA</h1>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Lado izquierdo: Cliente */}
          <div className="bg-blue-900 text-white p-6 rounded-lg flex-1 min-w-[300px]">
            <h2 className="text-2xl font-semibold mb-4 text-center">Cliente</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Nombre del cliente"
                  value={clienteSeleccionado ? clienteSeleccionado.nombre : clienteInput}
                  onChange={(e) => setClienteInput(e.target.value)}
                  disabled={!!clienteSeleccionado}
                  className="w-full p-2 rounded text-black"
                />
                <button
                  onClick={buscarCliente}
                  disabled={!!clienteSeleccionado}
                  className="p-2 rounded bg-white text-blue-900 hover:bg-sky-300 transition"
                  title="Buscar cliente"
                >
                  <MdSearch size={24} />
                </button>
                {clienteSeleccionado && (
                  <button
                    onClick={() => {
                      setClienteSeleccionado(null);
                      setClienteInput('');
                    }}
                    className="p-2 rounded bg-white text-red-600 hover:bg-red-300 transition"
                    title="Eliminar cliente"
                  >
                    <MdDeleteForever size={24} />
                  </button>
                )}
              </div>
            </div>


             {/* Detalles del cliente seleccionado */}
              {clienteSeleccionado && (
                <div className="bg-blue-800 p-4 rounded mt-2 text-sm space-y-1">
                  <p><strong>Nombre:</strong> {clienteSeleccionado.nombre || '-'}</p>
                  <p><strong>Dirección:</strong> {clienteSeleccionado.direccion || '-'}</p>
                  <p><strong>Ciudad:</strong> {clienteSeleccionado.ciudad || '-'}</p>
                  <p><strong>Provincia:</strong> {clienteSeleccionado.provincia || '-'}</p>
                  <p><strong>Teléfono:</strong> {clienteSeleccionado.telefono || '-'}</p>
                  <p><strong>Email:</strong> {clienteSeleccionado.email || '-'}</p>
                </div>
              )}
          </div>

          {/* Modal de resultados cliente */}
          {mostrarModalCliente && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
              <div className="bg-white rounded-lg p-4 max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">Seleccionar Cliente</h3>
                <ul className="max-h-60 overflow-y-auto">
                  {resultadosClientes.length > 0 ? (
                    resultadosClientes.map((cliente, idx) => (
                      <li
                        key={idx}
                        className="p-2 border-b hover:bg-gray-100 cursor-pointer"
                        onClick={() => seleccionarCliente(cliente)}
                      >
                        {cliente.nombre}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500">No se encontraron resultados.</li>
                  )}
                </ul>
                <button
                  onClick={() => setMostrarModalCliente(false)}
                  className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}

          {/* Lado derecho: Producto */}
          <div className="bg-blue-500 p-6 rounded-lg flex-1 text-white">
            <h2 className="text-2xl font-semibold mb-4 text-center">Productos</h2>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Buscar producto"
                className="flex-1 p-2 rounded text-black"
                value={productoInput}
                onChange={(e) => setProductoInput(e.target.value)}
              />
              <button
                onClick={buscarProducto}
                className="p-2 rounded bg-white text-blue-900 hover:bg-sky-300 transition"
                title="Buscar producto"
              >
                <MdSearch size={24} />
              </button>
            </div>

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
                          className="p-2 border-b hover:bg-gray-100 cursor-pointer text-black"
                          onClick={() => seleccionarProducto(producto)}
                        >
                          {producto.nombre} - ${producto.precio}
                        </li>

                      ))
                    ) : (
                      <li className="text-gray-500">No se encontraron resultados.</li>
                    )}
                  </ul>

                  {/* Detalles producto seleccionado */}
                  {productoSeleccionado && (
                    <div className="mt-4">
                      <div className="mb-2 text-xl font-bold text-green-700">
                        STOCK DISPONIBLE: {productoSeleccionado.stock_actual}
                      </div>
                      <div className="mb-2 text-black">Precio unitario: ${productoSeleccionado.precio}</div>
                      
                      <div className="flex items-center gap-4 mb-4">
                        <label htmlFor="cantidad" className="text-black">Cantidad:</label>
                        <div className="flex items-center space-x-2">
                          <button 
                            className="bg-gray-300 hover:bg-gray-400 text-black w-8 h-8 rounded flex items-center justify-center font-bold"
                            onClick={() => {
                              const nuevaCantidad = Math.max(1, cantidad - 1);
                              setCantidad(nuevaCantidad);
                              setSubtotal(nuevaCantidad * productoSeleccionado.precio);
                            }}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={cantidad}
                            onChange={(e) => {
                              const nuevaCantidad = Math.max(1, Number(e.target.value));
                              setCantidad(nuevaCantidad);
                              setSubtotal(nuevaCantidad * productoSeleccionado.precio);
                            }}
                            min="1"
                            className="w-16 p-2 rounded text-black border border-gray-300 text-center"
                          />
                          <button 
                            className="bg-gray-300 hover:bg-gray-400 text-black w-8 h-8 rounded flex items-center justify-center font-bold"
                            onClick={() => {
                              const nuevaCantidad = cantidad + 1;
                              setCantidad(nuevaCantidad);
                              setSubtotal(nuevaCantidad * productoSeleccionado.precio);
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="text-black font-semibold mb-4">
                        Subtotal: ${Number(subtotal).toFixed(2)}
                      </div>

                      <button
                        onClick={() => {
                          if (cantidad <= 0) return alert("La cantidad debe ser mayor a cero.");
                          agregarProducto();
                        }}
                        className="bg-green-600 hover:bg-green-800 text-white px-6 py-2 rounded"
                      >
                        Agregar Producto
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => setMostrarModalProducto(false)}
                    className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}

            
          </div>
        </div>

        {/* Tabla productos mejorada para responsive */}
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Productos Seleccionados</h3>
          
          {/* Vista de escritorio */}
          <div className="hidden md:block overflow-x-auto bg-white rounded shadow text-black">
            <table className="w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2">Producto</th>
                  <th className="p-2">Cantidad</th>
                  <th className="p-2">Subtotal</th>
                  <th className="p-2">Eliminar</th>
                </tr>
              </thead>
              <tbody>
                {productos.length > 0 ? (
                  productos.map((prod, idx) => (
                    <tr key={idx} className="text-center">
                      <td className="p-2">{prod.nombre}</td>
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
                      <td className="p-2">${prod.subtotal.toFixed(2)}</td>
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
                    <td colSpan="4" className="p-4 text-center text-gray-500">
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
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="ml-2 font-medium">${prod.subtotal.toFixed(2)}</span>
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
        
        {/* Total de la venta */}
        {productos.length > 0 && (
          <div className="mt-6 flex justify-end">
            <div className="bg-yellow-300 text-black text-2xl font-bold p-4 rounded shadow-lg">
              Total: ${Number(total).toFixed(2)}
            </div>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row justify-end mt-6 gap-4">
          <button 
            className="bg-green-600 hover:bg-green-800 px-6 py-2 rounded text-white font-semibold"
            onClick={confirmarVenta}
          >
            Confirmar Venta
          </button>
          <button 
            className="bg-red-600 hover:bg-red-800 px-6 py-2 rounded text-white font-semibold"
            onClick={confirmarSalida}
          >
            Volver al Menú
          </button>
        </div>
      </div>
      
      {/* Modal de confirmación de venta */}
      {mostrarConfirmacion && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4 text-center">Confirmar Venta</h3>
            <div className="text-center mb-6">
              <p className="mb-2">¿Deseas confirmar la venta para el cliente <span className="font-bold">{clienteSeleccionado.nombre}</span> con una cantidad de <span className="font-bold">{productos.reduce((total, prod) => total + prod.cantidad, 0)}</span> productos y un total de <span className="font-bold text-green-700">${Number(total).toFixed(2)}</span>?</p>
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  handleRegistrarVenta();
                  setMostrarConfirmacion(false);
                }}
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
              <p className="mb-2">Se perderán los datos guardados.</p>
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
    </div>
  );
}