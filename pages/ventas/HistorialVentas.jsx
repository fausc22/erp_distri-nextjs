import { useState, useEffect, Fragment } from 'react';
import { MdSearch, MdDeleteForever, MdCloudUpload, MdRemoveRedEye } from "react-icons/md";
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

  // Estados para la paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
  
  const [selectedVentas, setSelectedVentas] = useState([]);
  
  // Estados para la gestión de comprobantes
  const [mostrarModalComprobante, setMostrarModalComprobante] = useState(false);
  const [comprobante, setComprobante] = useState(null);
  const [comprobantePreview, setComprobantePreview] = useState(null);
  const [comprobanteExistente, setComprobanteExistente] = useState(false);
  const [uploadingComprobante, setUploadingComprobante] = useState(false);
  
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

  // Función para cambiar de página
  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
  };

  // Calcular índices para mostrar solo los registros de la página actual
  const indexOfUltimoRegistro = paginaActual * registrosPorPagina;
  const indexOfPrimerRegistro = indexOfUltimoRegistro - registrosPorPagina;
  const ventasActuales = ventas.slice(indexOfPrimerRegistro, indexOfUltimoRegistro);

  // Calcular el número total de páginas
  const totalPaginas = Math.ceil(ventas.length / registrosPorPagina);

  // ===== FUNCIONES PARA GESTIÓN DE COMPROBANTES =====
  
  // Función para verificar si existe un comprobante para la venta seleccionada
  const verificarComprobanteExistente = async (ventaId) => {
    try {
      // Intentamos obtener el comprobante - si existe, la respuesta será el archivo
      // Si no existe, obtendremos un error 404
      const response = await axios.get(`http://localhost:3001/ventas/cargarComprobante/${ventaId}`, {
        responseType: 'blob'
      });
      
      // Si llegamos aquí, es que existe un comprobante
      setComprobanteExistente(true);
      return true;
    } catch (error) {
      // Si obtenemos un error 404, significa que no existe el comprobante
      if (error.response && error.response.status === 404) {
        setComprobanteExistente(false);
        return false;
      } else {
        console.error("Error al verificar el comprobante:", error);
        toast.error("Error al verificar el comprobante");
        setComprobanteExistente(false);
        return false;
      }
    }
  };

  // Función para abrir el modal de comprobantes
  const handleOpenComprobanteModal = async () => {
    if (!selectedVenta) {
      toast.error("Seleccione una venta primero");
      return;
    }
    
    // Limpiar estados previos
    setComprobante(null);
    setComprobantePreview(null);
    
    // Verificar si hay un comprobante existente
    await verificarComprobanteExistente(selectedVenta.id);
    
    // Abrir el modal
    setMostrarModalComprobante(true);
  };

  // Función para manejar la selección de archivo
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setComprobante(file);
      
      // Generar preview si es una imagen
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setComprobantePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        // Para PDFs u otros tipos, mostrar un ícono o alguna representación
        setComprobantePreview(null);
      }
    }
  };

  // Función para cargar el comprobante
  const handleUploadComprobante = async () => {
    if (!comprobante || !selectedVenta) {
      toast.error("Seleccione un archivo y una venta");
      return;
    }

    setUploadingComprobante(true);

    try {
      const formData = new FormData();
      formData.append("comprobante", comprobante);

      const response = await axios.post(
        `http://localhost:3001/ventas/guardarComprobante/${selectedVenta.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("Comprobante cargado exitosamente");
        setComprobanteExistente(true);
        
        // Cerrar el modal después de cargar
        setTimeout(() => {
          setMostrarModalComprobante(false);
        }, 1500);
      } else {
        toast.error(response.data.message || "Error al cargar el comprobante");
      }
    } catch (error) {
      console.error("Error al cargar el comprobante:", error);
      toast.error("Error al cargar el comprobante");
    } finally {
      setUploadingComprobante(false);
    }
  };

  // Función para ver el comprobante
  const handleViewComprobante = () => {
    if (!selectedVenta) return;
    
    // Abrir en una nueva pestaña
    window.open(`http://localhost:3001/ventas/cargarComprobante/${selectedVenta.id}`, '_blank');
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
                    checked={ventasActuales.length > 0 && ventasActuales.every(v => selectedVentas.includes(v.id))}
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
            {ventasActuales.length > 0 ? (
                ventasActuales.map((venta) => (
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
        
        {/* Paginador */}
        {ventas.length > 0 && (
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
                Mostrando {indexOfPrimerRegistro + 1} a {Math.min(indexOfUltimoRegistro, ventas.length)} de {ventas.length} registros
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
        
        {/* Vista móvil para la tabla de ventas */}
        <div className="md:hidden space-y-4">
        {ventasActuales.length > 0 ? (
            ventasActuales.map((venta) => (
            <div key={venta.id} 
                className="bg-white p-4 rounded shadow hover:bg-gray-50 cursor-pointer">
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
                <div onClick={() => handleRowDoubleClick(venta)}>
                <div className="flex justify-between">
                    <span className="font-bold">ID:</span>
                    <span>{venta.id}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-bold">Fecha:</span>
                    <span>{venta.fecha}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-bold">Cliente:</span>
                    <span>{venta.cliente_nombre}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-bold">Total:</span>
                    <span>${venta.total}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-bold">Estado:</span>
                    <span>{venta.estado}</span>
                </div>
                </div>
            </div>
            ))
        ) : (
            <div className="p-4 text-center text-gray-500 bg-white rounded shadow">
            No hay ventas registradas
            </div>
        )}
        
        {/* Paginador para móvil (simplificado) */}
        {ventas.length > 0 && (
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
                <option value={50}>50 por página</option>
                </select>
            </div>
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
                  onClick={handleOpenComprobanteModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mr-2"
                >
                  CARGAR COMPROBANTE
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
      
      {/* Modal para cargar comprobantes */}
      {mostrarModalComprobante && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h2 className="text-xl font-bold mb-4 text-center">Gestión de Comprobante</h2>
            
            <div className="text-center mb-4">
              <p className="text-gray-700">
                Venta #{selectedVenta.id} - {selectedVenta.cliente_nombre}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              {comprobanteExistente ? (
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <MdRemoveRedEye size={36} className="text-blue-600" />
                  </div>
                  <p className="mb-4 text-green-700 font-medium">
                    Esta venta ya tiene un comprobante cargado.
                  </p>
                  <button 
                    onClick={handleViewComprobante}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mb-4 w-full sm:w-auto"
                  >
                    Ver Comprobante
                  </button>
                  <p className="text-sm text-gray-600 mt-2">
                    Si necesitas reemplazar el comprobante, selecciona un nuevo archivo.
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <MdCloudUpload size={48} className="text-blue-600" />
                  </div>
                  <p className="mb-4">
                    No hay ningún comprobante cargado para esta venta.
                  </p>
                </div>
              )}
            </div>
            
            <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg bg-white text-center hover:bg-gray-50 transition-colors cursor-pointer mb-6">
              <input 
                type="file"
                id="comprobante-input"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <label 
                htmlFor="comprobante-input"
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <span className="text-blue-600 hover:text-blue-800 font-medium mb-2">
                  Haz clic aquí para seleccionar un archivo
                </span>
                <span className="text-xs text-gray-500">
                  Formatos aceptados: PDF, JPG, JPEG, PNG
                </span>
              </label>
              
              {comprobante && (
                <div className="mt-4 p-2 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-700">Archivo seleccionado:</p>
                  <p className="text-sm text-gray-600 truncate">{comprobante.name}</p>
                  
                  {comprobantePreview && (
                    <div className="mt-2 flex justify-center">
                      <img 
                        src={comprobantePreview} 
                        alt="Vista previa" 
                        className="h-32 object-contain rounded border" 
                      />
                    </div>
                  )}
                  
                  {!comprobantePreview && comprobante.type === 'application/pdf' && (
                    <div className="mt-2 flex justify-center">
                      <p className="text-xs text-gray-500">
                        Vista previa no disponible para archivos PDF
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6">
              <button 
                onClick={() => setMostrarModalComprobante(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded order-2 sm:order-1"
              >
                Cancelar
              </button>
              
              <button 
                onClick={handleUploadComprobante}
                disabled={!comprobante || uploadingComprobante}
                className={`px-4 py-2 rounded text-white order-1 sm:order-2 ${
                  !comprobante || uploadingComprobante 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {uploadingComprobante ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Subiendo...
                  </div>
                ) : "Subir Comprobante"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Toaster />
    </div>
  );
}