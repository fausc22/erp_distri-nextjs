import { useState, useEffect } from 'react';
import { MdSearch, MdDeleteForever } from "react-icons/md";
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import Head from 'next/head';
import useAuth from '../../hooks/useAuth';

export default function HistorialVentas() {
  const [ventas, setVentas] = useState([]); // Estado para almacenar las ventas
  const [selectedVenta, setSelectedVenta] = useState(null);
  const [productos, setProductos] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [mostrarConfirmacionSalida, setMostrarConfirmacionSalida] = useState(false);
  const [productDialogVisible, setProductDialogVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [searchProduct, setSearchProduct] = useState('');
  const [products, setProducts] = useState([]);
  const [productQuantity, setProductQuantity] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [mostrarModalCliente, setMostrarModalCliente] = useState(false);
  const [resultadosClientes, setResultadosClientes] = useState([]);
  const [imprimiendo, setImprimiendo] = useState(false);
  
    const [selectedVentas, setSelectedVentas] = useState([]);
    
  
  useAuth();

  useEffect(() => {
    axios.get('http://localhost:3001/ventas/obtener-ventas')
      .then((response) => {
        setVentas(response.data); // Guardar ventas en el estado
      })
      .catch((error) => {
        console.error("Error al obtener ventas:", error);
        toast.error("No se pudieron cargar los comprobantes");
      });
  }, []);

  // Obtener productos de un pedido cuando se selecciona una venta
  const handleRowDoubleClick = async (venta) => {
    setSelectedVenta(venta);
    setModalIsOpen(true);

    try {
      const response = await axios.get(`http://localhost:3001/ventas/obtener-productos-venta/${venta.id}`);
      setProductos(response.data); 
    } catch (error) {
      console.error("Error al obtener productos del pedido:", error);
      toast.error("No se pudieron cargar los productos del pedido");
    }
  };

  // Función para modificar la cantidad o precio de un producto
  const handleProductoChange = (index, field, value) => {
    const updatedProductos = [...productos];
    updatedProductos[index][field] = value;
    updatedProductos[index].subtotal = (updatedProductos[index].cantidad * updatedProductos[index].precio).toFixed(2);
    setProductos(updatedProductos);
  };

  // Función para agregar un nuevo producto
  const handleAgregarProducto = () => {
    setProductos([...productos, { id: null, nombre: '', cantidad: 1, precio: 0, subtotal: 0 }]);
  };

  // Función para eliminar un producto del pedido
  const handleEliminarProducto = (index) => {
    setProductos(productos.filter((_, i) => i !== index));
  };

  // Función para confirmar el pedido
  const handleConfirmarPedido = async () => {
    try {
      await axios.put(`http://localhost:3001/ventas/modificar-estado-venta/${selectedVenta.id}`, { estado: 'CONFIRMADA' });
      toast.success("Pedido confirmado");
      setModalIsOpen(false);

      const ventaData = {
        venta_id: selectedVenta.id,
        cliente_id: selectedVenta.cliente_id,
        cliente_nombre: selectedVenta.cliente_nombre,
        cliente_condicion: selectedVenta.cliente_condicion,
        cliente_cuit: selectedVenta.cliente_cuit,
        cliente_telefono: selectedVenta.cliente_telefono,
        cliente_direccion: selectedVenta.cliente_direccion,
        cliente_ciudad: selectedVenta.cliente_ciudad,
        cliente_provincia: selectedVenta.cliente_provincia,
        estado: 'Pendiente',
        observaciones: '-',
        productos: productos.map(p => ({
          producto_id: p.producto_id,
          producto_nombre: p.producto_nombre,
          producto_um: p.producto_um,
          cantidad: p.cantidad,
        })),
      };
    
      console.log("Datos de la venta antes de enviarse:", ventaData);
    
      const response = await axios.post('http://localhost:3001/productos/nuevo-remito', ventaData);
      toast.success('Remito generado con éxito');
    } catch (error) {
      console.error('Error al confirmar pedido o generar remito:', error);
      toast.error('Error al confirmar el pedido');
    }
  };

  // Función para anular el pedido
  const handleAnularPedido = async () => {
    try {
      await axios.put(`http://localhost:3001/ventas/modificar-estado-venta/${selectedVenta.id}`, { estado: 'ANULADA' });
      toast.success("Pedido anulado");
      setModalIsOpen(false);
      setVentas(ventas.filter(v => v.id !== selectedVenta.id));
    } catch (error) {
      console.error("Error al anular pedido:", error);
      toast.error("Error al anular pedido");
    }
  };

  const onProductDoubleClick = (product) => {
    setSelectedProduct(product);
    setProductDialogVisible(true);
  };

  // Función para abrir el modal de productos
  const handleOpenProductModal = () => {
    setModalIsOpen(false);
    setTimeout(() => setProductModalOpen(true), 300);
  };

  // Función para cerrar el modal de productos
  const handleCloseProductModal = () => {
    setProductModalOpen(false);
  };

  const handleSearchProduct = async () => {
    if (!searchProduct.trim()) {
      toast.error('Ingrese un producto para buscar');
      return;
    }
    try {
      const response = await axios.get(`http://localhost:3001/ventas/filtrar-producto?q=${searchProduct}`);
      setProducts(response.data);
      setProductModalOpen(true);
    } catch (error) {
      console.error('Error al buscar productos:', error);
      toast.error('Error al buscar productos');
    }
  };

  const handleProductSelection = (product) => {
    setSelectedProduct(product);
  };

  const handleAddProduct = async () => {
    if (!selectedProduct || productQuantity < 1) {
      toast.error('Debe seleccionar un producto y una cantidad válida');
      return;
    }

    const precio = parseFloat(selectedProduct.precio);
    const iva = parseFloat((precio * 0.21).toFixed(2));
    const subtotal = parseFloat((precio * productQuantity).toFixed(2));

    const newProduct = {
      producto_id: selectedProduct.id,
      producto_nombre: selectedProduct.nombre,
      producto_um: selectedProduct.unidad_medida,
      cantidad: productQuantity,
      precio,
      iva,
      subtotal
    };

    try {
      const response = await axios.post(`http://localhost:3001/ventas/agregar-producto/${selectedVenta.id}`, newProduct);
      if (response.data.success) {
        toast.success(`Producto agregado: ${newProduct.cantidad} x ${newProduct.producto_nombre}`);
          
        // Recargar productos y actualizar el total
        await handleRowDoubleClick(selectedVenta);
        await actualizarTotalPedido(selectedVenta.id);

        // Cerrar modal de productos primero
        setProductModalOpen(false);
        // Esperar un pequeño tiempo antes de reabrir el modal de detalle
        setTimeout(() => {
          setModalIsOpen(true);
        }, 300);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error al agregar el producto al pedido:', error);
      toast.error('No se pudo agregar el producto.');
    }

    // Limpiar estados para la próxima selección
    setSelectedProduct(null);
    setProductQuantity(1);
    setProducts([]);
    setSearchProduct('');
  };

  const handleOpenDeleteModal = (product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
    setModalIsOpen(false);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      const response = await axios.delete(`http://localhost:3001/ventas/eliminar-producto-venta/${productToDelete.id}`);
      
      if (response.data.success) {
        toast.success(`Producto eliminado: ${productToDelete.producto_nombre}`);
        
        // Recargar productos y actualizar el total
        await handleRowDoubleClick(selectedVenta);
        await actualizarTotalPedido(selectedVenta.id);

        // Cerrar el modal de eliminación
        setDeleteModalOpen(false);
        setProductToDelete(null);
        setTimeout(() => {
          setModalIsOpen(true);
        }, 300);
        
      } else {
        toast.error('No se pudo eliminar el producto.');
      }
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
      toast.error('Error al eliminar el producto.');
    }
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;

    // Validar que los valores sean correctos
    const updatedProduct = {
      cantidad: selectedProduct.cantidad || 1,
      precio: selectedProduct.precio || 0,
      iva: (selectedProduct.precio * 0.21).toFixed(2),
      subtotal: (selectedProduct.cantidad * selectedProduct.precio).toFixed(2)
    };

    try {
      const response = await axios.put(
        `http://localhost:3001/ventas/actualizar-producto-venta/${selectedProduct.id}`,
        updatedProduct
      );

      if (response.data.success) {
        toast.success(`Producto actualizado: ${selectedProduct.producto_nombre}`);

        // Recargar productos y actualizar total
        await handleRowDoubleClick(selectedVenta);
        await actualizarTotalPedido(selectedVenta.id);

        setProductDialogVisible(false);
        setTimeout(() => {
          setModalIsOpen(true);
        }, 300);
      } else {
        toast.error('No se pudo actualizar el producto.');
      }
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
      toast.error('Error al actualizar el producto.');
    }
  };

  const handleCancelar = () => {
    setDeleteModalOpen(false);
    setModalIsOpen(true);
  };

  const actualizarTotalPedido = async (ventaId) => {
    const nuevoTotal = productos
      .reduce((acc, prod) => acc + parseFloat(prod.subtotal || 0), 0)
      .toFixed(2);

    try {
      const response = await axios.put(`http://localhost:3001/ventas/actualizar-venta/${ventaId}`, { total: parseFloat(nuevoTotal) });

      if (response.data.success) {
        toast.success("Total actualizado correctamente");
        setSelectedVenta(prev => ({ ...prev, total: nuevoTotal }));
      }
    } catch (error) {
      console.error("Error al actualizar el total del pedido:", error);
      toast.error("No se pudo actualizar el total del pedido");
    }
  };

  const handleCantidadChange = (e) => {
    const nuevaCantidad = parseInt(e.target.value) || 1;
    
    setSelectedProduct((prev) => ({
      ...prev,
      cantidad: nuevaCantidad,
      subtotal: (nuevaCantidad * prev.precio).toFixed(2)
    }));
  };

  const generarPDF = async () => {
    if (!selectedVenta || productos.length === 0) {
      toast.error("Seleccione un cliente y al menos un producto");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3001/ventas/generarpdf-factura",
        {
          venta: selectedVenta,
          productos: productos,
        },
        { responseType: "blob" }
      );

      // Crear un link para descargar el PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `FACTURA - ${selectedVenta.cliente_nombre}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      toast.error("Error al generar el PDF");
    }
  };

  // Función para manejar el intento de salir
  const confirmarSalida = () => {
    // En este caso solo verificamos si hay una venta seleccionada
    if (selectedVenta) {
      setMostrarConfirmacionSalida(true);
    } else {
      // Si no hay datos, redirigir directamente
      window.location.href = '/';
    }
  };

  const seleccionarCliente = (cliente) => {
    // Implementar lógica para seleccionar cliente
    setMostrarModalCliente(false);
  };

    

// Agrega esta función para manejar la selección/deselección de ventas
const handleSelectVenta = (ventaId) => {
  if (selectedVentas.includes(ventaId)) {
    setSelectedVentas(selectedVentas.filter(id => id !== ventaId));
  } else {
    setSelectedVentas([...selectedVentas, ventaId]);
  }
};

// Agrega esta función para seleccionar/deseleccionar todas las ventas
const handleSelectAllVentas = (e) => {
  if (e.target.checked) {
    setSelectedVentas(ventas.map(venta => venta.id));
  } else {
    setSelectedVentas([]);
  }
};


const imprimirFacturasSeleccionadas = async () => {
    if (selectedVentas.length === 0) {
      toast.error("Seleccione al menos un pedido para imprimir");
      return;
    }
  
    setImprimiendo(true); // Activar el estado de carga
  
    try {
      const response = await axios.post(
        "http://localhost:3001/ventas/generarpdf-facturas-multiples",
        { ventasIds: selectedVentas },
        { responseType: "blob" }
      );
  
      // Crear un link para descargar el PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `Facturas-Multiples.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success(`${selectedVentas.length} facturas generadas con éxito`);
    } catch (error) {
      console.error("Error al generar múltiples PDFs:", error);
      toast.error("Error al generar las facturas");
    } finally {
      setImprimiendo(false); // Desactivar el estado de carga
    }
  };




  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Head>
        <title>VERTIMAR | HISTORIAL DE VENTAS</title>
        <meta name="description" content="Historial de ventas en el sistema VERTIMAR" />
      </Head>
      
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-6xl">
        <h1 className="text-2xl font-bold mb-4 text-center">HISTORIAL DE VENTAS</h1>
        
        {/* Vista de escritorio para la tabla de ventas */}
        <div className="hidden md:block overflow-x-auto bg-white rounded shadow text-black">
        <table className="w-full">
            <thead className="bg-gray-200">
            <tr>
                <th className="p-2 w-10">
                <input 
                    type="checkbox" 
                    onChange={handleSelectAllVentas}
                    checked={selectedVentas.length === ventas.length && ventas.length > 0}
                    className="w-4 h-4"
                />
                </th>
                <th className="p-2">ID</th>
                <th className="p-2">Fecha</th>
                <th className="p-2">Cliente</th>
                <th className="p-2">Tipo Doc.</th>
                <th className="p-2">Tipo Fiscal</th>
                <th className="p-2">TOTAL ($)</th>
                <th className="p-2">Estado</th>
                <th className="p-2">CAE</th>
            </tr>
            </thead>
            <tbody>
            {ventas.length > 0 ? (
                ventas.map((venta) => (
                <tr key={venta.id} 
                    className="hover:bg-gray-100 cursor-pointer">
                    <td className="p-2 text-center">
                    <input 
                        type="checkbox"
                        checked={selectedVentas.includes(venta.id)}
                        onChange={() => handleSelectVenta(venta.id)}
                        className="w-4 h-4"
                        onClick={(e) => e.stopPropagation()}
                    />
                    </td>
                    <td className="p-2 text-center" onDoubleClick={() => handleRowDoubleClick(venta)}>{venta.id}</td>
                    <td className="p-2" onDoubleClick={() => handleRowDoubleClick(venta)}>{venta.fecha}</td>
                    <td className="p-2" onDoubleClick={() => handleRowDoubleClick(venta)}>{venta.cliente_nombre}</td>
                    <td className="p-2" onDoubleClick={() => handleRowDoubleClick(venta)}>{venta.tipo_documento}</td>
                    <td className="p-2" onDoubleClick={() => handleRowDoubleClick(venta)}>{venta.tipo_fiscal}</td>
                    <td className="p-2" onDoubleClick={() => handleRowDoubleClick(venta)}>${venta.total}</td>
                    <td className="p-2" onDoubleClick={() => handleRowDoubleClick(venta)}>{venta.estado}</td>
                    <td className="p-2 text-center" onDoubleClick={() => handleRowDoubleClick(venta)}>
                    <span className={`inline-block px-2 py-1 rounded ${venta.cae_id ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                        {venta.cae_id ? '✓' : '✗'}
                    </span>
                    </td>
                </tr>
                ))
            ) : (
                <tr>
                <td colSpan="9" className="p-4 text-center text-gray-500">
                    No hay ventas registradas
                </td>
                </tr>
            )}
            </tbody>
        </table>
        </div>
        
        {/* Vista móvil para la tabla de ventas */}
        <div className="md:hidden space-y-4">
        {ventas.length > 0 ? (
            ventas.map((venta) => (
            <div key={venta.id} 
                className="bg-white p-4 rounded shadow hover:bg-gray-50 cursor-pointer"
                onClick={() => handleRowDoubleClick(venta)}>
                <div className="flex justify-between items-center mb-2">
                <input 
                    type="checkbox"
                    checked={selectedVentas.includes(venta.id)}
                    onChange={() => handleSelectVenta(venta.id)}
                    className="w-4 h-4"
                    onClick={(e) => e.stopPropagation()}
                />
                <span className={`inline-block px-2 py-1 rounded ${venta.cae_id ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                    {venta.cae_id ? '✓' : '✗'}
                </span>
                </div>
                {/* Resto del contenido sin cambios */}
                <div className="flex justify-between">
                <span className="font-bold">ID:</span>
                <span>{venta.id}</span>
                </div>
                {/* ... */}
            </div>
            ))
        ) : (
            <div className="p-4 text-center text-gray-500 bg-white rounded shadow">
            No hay ventas registradas
            </div>
        )}
        </div>
        
        <div className="flex flex-col sm:flex-row justify-end mt-6 gap-4">
        <button 
                className={`px-6 py-2 rounded text-white font-semibold ${
                imprimiendo 
                    ? "bg-gray-500 cursor-not-allowed" 
                    : "bg-purple-600 hover:bg-purple-800"
                }`}
                onClick={imprimirFacturasSeleccionadas}
                disabled={selectedVentas.length === 0 || imprimiendo}
            >
                {imprimiendo ? (
                <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    IMPRIMIENDO...
                </div>
                ) : (
                `IMPRIMIR (${selectedVentas.length})`
                )}
        </button>
          <button 
            className="bg-red-600 hover:bg-red-800 px-6 py-2 rounded text-white font-semibold"
            onClick={confirmarSalida}
          >
            Volver al Menú
          </button>
        </div>
      </div>
      
      {/* Modal de detalles de venta */}
      {selectedVenta && modalIsOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-center">Detalles del Pedido</h2>
            <h4 className="mt-2"><strong>Fecha:</strong> {selectedVenta.fecha}</h4>
            
            <div className="flex flex-col md:flex-row justify-between gap-4 mt-4">
              {/* Información del Cliente (Izquierda) */}
              <div className="w-full md:w-1/2">
                <h3 className="font-bold mb-2">Información del Cliente</h3>
                <p><strong>Cliente:</strong> {selectedVenta.cliente_nombre}</p>
                <p><strong>Dirección:</strong> {selectedVenta.cliente_direccion}</p>
                <p><strong>Ciudad:</strong> {selectedVenta.cliente_ciudad}</p>
                <p><strong>Provincia:</strong> {selectedVenta.cliente_provincia}</p>
                <p><strong>Condición IVA:</strong> {selectedVenta.cliente_condicion}</p>
                <p><strong>CUIT:</strong> {selectedVenta.cliente_cuit}</p>
              </div>
              
              {/* Información del Documento y Totales (Derecha) */}
              <div className="w-full md:w-1/2">
                <h3 className="font-bold mb-2">Información del Documento</h3>
                <p><strong>DOCUMENTO:</strong> {selectedVenta.tipo_documento}</p>
                <p><strong>TIPO FISCAL:</strong> {selectedVenta.tipo_fiscal}</p>
                <p><strong>Total:</strong> $ {selectedVenta.total}</p>
                <p><strong>ESTADO:</strong> {selectedVenta.estado}</p>
                <p><strong>CAE:</strong> {selectedVenta.cae_id ? '✓' : '✗'}</p>
                <p><strong>FECHA CAE:</strong> {selectedVenta.cae_fecha}</p>
              </div>
            </div>
            
            {/* Sección de productos */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">Productos</h3>
                <button 
                  onClick={handleOpenProductModal}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                >
                  AGREGAR PRODUCTO
                </button>
              </div>
              
              <div className="overflow-x-auto bg-white rounded shadow">
                <table className="w-full">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="p-2">Código</th>
                      <th className="p-2">Nombre</th>
                      <th className="p-2">UM</th>
                      <th className="p-2">Cantidad</th>
                      <th className="p-2">Precio ($)</th>
                      <th className="p-2">IVA ($)</th>
                      <th className="p-2">Subtotal ($)</th>
                      <th className="p-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.length > 0 ? (
                      productos.map((producto) => (
                        <tr key={producto.id} 
                            className="hover:bg-gray-100 cursor-pointer"
                            onDoubleClick={() => onProductDoubleClick(producto)}>
                          <td className="p-2">{producto.producto_id}</td>
                          <td className="p-2">{producto.producto_nombre}</td>
                          <td className="p-2">{producto.producto_um}</td>
                          <td className="p-2">{producto.cantidad}</td>
                          <td className="p-2">{producto.precio}</td>
                          <td className="p-2">{producto.iva}</td>
                          <td className="p-2">{producto.subtotal}</td>
                          <td className="p-2">
                            <button 
                              onClick={() => handleOpenDeleteModal(producto)}
                              className="bg-red-500 text-white p-1 rounded"
                            >
                              <MdDeleteForever size={20} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="p-4 text-center text-gray-500">
                          No hay productos en este pedido
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-between gap-2 mt-6">
              <div>
                <button 
                  onClick={handleConfirmarPedido}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mr-2"
                >
                  Confirmar Pedido
                </button>
                <button 
                  onClick={handleAnularPedido}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  Anular Pedido
                </button>
              </div>
              <div>
                <button 
                  onClick={generarPDF}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded mr-2"
                >
                  IMPRIMIR FACTURA
                </button>
                <button 
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded"
                >
                  SOLICITAR CAE
                </button>
              </div>
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
      
      {/* Modal de búsqueda de productos */}
      {productModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-center">Buscar Producto</h2>
            
            <div className="flex items-center gap-2 mb-6">
              <input 
                type="text"
                className="border p-2 flex-grow rounded"
                placeholder="Buscar Producto"
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
              />
              <button 
                onClick={handleSearchProduct}
                className="bg-green-600 hover:bg-green-700 text-white p-2 rounded"
              >
                <MdSearch size={24} />
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Lista de productos (izquierda) */}
              <div className="border rounded p-4 h-80 overflow-y-auto">
                <h3 className="font-bold mb-2">Productos Encontrados</h3>
                {products.length > 0 ? (
                  products.map((product, index) => (
                    <div 
                      key={index}
                      className={`p-2 border-b cursor-pointer ${selectedProduct?.id === product.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                      onClick={() => handleProductSelection(product)}
                    >
                      {product.nombre}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No hay productos para mostrar</p>
                )}
              </div>
              
              {/* Detalles del producto (derecha) */}
              <div className="border rounded p-4">
                <h3 className="font-bold mb-4">Detalles del Producto</h3>
                {selectedProduct ? (
                  <div>
                    <p><strong>Nombre:</strong> {selectedProduct.nombre}</p>
                    <p><strong>Unidad de Medida:</strong> {selectedProduct.unidad_medida}</p>
                    <p><strong>Precio:</strong> ${selectedProduct.precio}</p>
                    <p><strong>Stock:</strong> {selectedProduct.stock_actual}</p>
                    
                    <div className="mt-4">
                      <label className="block mb-1">Cantidad:</label>
                      <input 
                        type="number"
                        className="border p-2 w-24 rounded"
                        value={productQuantity}
                        onChange={(e) => setProductQuantity(Math.max(1, Number(e.target.value)))}
                        min="1"
                      />
                    </div>
                    
                    <p className="mt-2"><strong>Subtotal:</strong> ${(selectedProduct.precio * productQuantity).toFixed(2)}</p>
                    
                    <button 
                      onClick={handleAddProduct}
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
                    >
                      Agregar Producto
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-500">Seleccione un producto de la lista</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button 
                onClick={handleCloseProductModal}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de edición de producto */}
      {selectedProduct && productDialogVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4 text-center">Editar Producto</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Nombre:</label>
                <input 
                  type="text"
                  className="border p-2 w-full rounded bg-gray-100"
                  value={selectedProduct.producto_nombre || ''}
                  disabled
                />
              </div>
              
              {/* Modal de edición de producto (continuación) */}
              <div>
                <label className="block mb-1">Unidad de Medida:</label>
                <input 
                  type="text"
                  className="border p-2 w-full rounded bg-gray-100"
                  value={selectedProduct.producto_um || ''}
                  disabled
                />
              </div>
              
              <div>
                <label className="block mb-1">Precio ($):</label>
                <div className="flex items-center">
                  <span className="mr-1">$</span>
                  <input 
                    type="number"
                    className="border p-2 w-full rounded"
                    value={selectedProduct.precio || 0}
                    onChange={(e) => setSelectedProduct({ 
                      ...selectedProduct, 
                      precio: parseFloat(e.target.value) || 0,
                      subtotal: ((parseFloat(e.target.value) || 0) * selectedProduct.cantidad).toFixed(2)
                    })}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div>
                <label className="block mb-1">Cantidad:</label>
                <input 
                  type="number"
                  className="border p-2 w-24 rounded"
                  value={selectedProduct.cantidad || 1}
                  onChange={handleCantidadChange}
                  min="1"
                />
              </div>
              
              <div>
                <label className="block mb-1">Subtotal ($):</label>
                <div className="flex items-center">
                  <span className="mr-1">$</span>
                  <input 
                    type="text"
                    className="border p-2 w-full rounded bg-gray-100"
                    value={selectedProduct.subtotal || 0}
                    disabled
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <button 
                onClick={handleUpdateProduct}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
              >
                Guardar Cambios
              </button>
              <button 
                onClick={() => setProductDialogVisible(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de confirmación para eliminar producto */}
      {deleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4 text-center">Confirmar Eliminación</h2>
            
            {productToDelete && (
              <>
                <p className="text-center my-4">
                  ¿Estás seguro de que deseas eliminar <strong>{productToDelete.cantidad}</strong> unidades de <strong>{productToDelete.producto_nombre}</strong>?
                </p>
                
                <div className="flex justify-center gap-4 mt-6">
                  <button 
                    onClick={handleDeleteProduct}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded"
                  >
                    Sí, eliminar
                  </button>
                  <button 
                    onClick={handleCancelar}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded"
                  >
                    No, cancelar
                  </button>
                </div>
              </>
            )}
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
      
      <Toaster />
    </div>
  );
}
				  