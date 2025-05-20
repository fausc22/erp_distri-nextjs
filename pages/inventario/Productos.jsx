import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { toast, Toaster } from 'react-hot-toast';
import Head from 'next/head';
import useAuth from '../../hooks/useAuth';

export default function Productos() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    unidad_medida: '',
    costo: '',
    precio: '',
    categoria_id: '',
    iva: '',
    stock_actual: ''
  });
  
  // Verificar autenticación
  useAuth();

  

  const handleSearch = async () => {
    if (searchQuery.length >= 3) {
      try {
        const response = await axios.get(`http://localhost:3001/productos/buscar-producto?search=${searchQuery}`);
        setSearchResults(response.data.data);
        setModalIsOpen(true);
      } catch (error) {
        console.error('Error al buscar productos:', error);
      }
    } else {
      toast.error('Ingrese al menos 3 caracteres para buscar');
    }
  };

  const handleResultClick = (product) => {
    setFormData({
      id: product.id,  // Asegurar que el ID se incluya en la edición
      nombre: product.nombre,
      unidad_medida: product.unidad_medida,
      costo: product.costo,
      precio: product.precio,
      categoria_id: product.categoria_id,
      iva: product.iva,
      stock_actual: product.stock_actual
    });

    setSearchQuery('');
    setModalIsOpen(false);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveProduct = async () => {
    try {
      if (formData.id) {
        await axios.put(`http://localhost:3001/productos/actualizar-producto/${formData.id}`, formData);
        toast.success('Producto actualizado correctamente');
      } else {
        await axios.post('http://localhost:3001/productos/crear-producto', formData);
        toast.success('Producto agregado correctamente');
      }
    } catch (error) {
      toast.error('Error al guardar producto');
      console.error(error);
    } finally {
      setFormData({
        nombre: '',
        unidad_medida: '',
        costo: '',
        precio: '',
        categoria_id: '',
        iva: '',
        stock_actual: ''
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      unidad_medida: '',
      costo: '',
      precio: '',
      categoria_id: '',
      iva: '',
      stock_actual: ''
    });
  };

  const renderForm = () => {
    switch (selectedOption) {
      case 'new':
        return (
          <div className="w-full">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-bold">NUEVO PRODUCTO</h2>
              <p className="text-gray-600">INSERTE LOS SIGUIENTES DATOS</p>
            </div>
            
            <div className="mb-4">
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-900 bg-gray-200 border rounded-l-md">
                  NOMBRE
                </span>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="rounded-none rounded-r-lg border text-gray-900 block flex-1 min-w-0 w-full p-2.5"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-900 bg-gray-200 border rounded-l-md">
                  CATEGORIA
                </span>
                <input
                  type="text"
                  name="categoria_id"
                  value={formData.categoria_id}
                  onChange={handleInputChange}
                  className="rounded-none rounded-r-lg border text-gray-900 block flex-1 min-w-0 w-full p-2.5"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-900 bg-gray-200 border rounded-l-md">
                  UNIDAD MEDIDA
                </span>
                <select
                  name="unidad_medida"
                  value={formData.unidad_medida}
                  onChange={handleInputChange}
                  className="rounded-none rounded-r-lg border text-gray-900 block flex-1 min-w-0 w-full p-2.5"
                >
                  <option value=""></option>
                  <option value="UNIDADES">UNIDADES</option>
                  <option value="LITROS">LITROS</option>
                </select>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-900 bg-gray-200 border rounded-l-md">
                  PRECIO COSTO
                </span>
                <span className="inline-flex items-center px-3 text-gray-900 bg-gray-100 border-t border-b">
                  $
                </span>
                <input
                  type="number"
                  name="costo"
                  value={formData.costo}
                  onChange={handleInputChange}
                  className="rounded-none rounded-r-lg border text-gray-900 block flex-1 min-w-0 w-full p-2.5"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-900 bg-gray-200 border rounded-l-md">
                  PRECIO VENTA
                </span>
                <span className="inline-flex items-center px-3 text-gray-900 bg-gray-100 border-t border-b">
                  $
                </span>
                <input
                  type="number"
                  name="precio"
                  value={formData.precio}
                  onChange={handleInputChange}
                  className="rounded-none rounded-r-lg border text-gray-900 block flex-1 min-w-0 w-full p-2.5"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-900 bg-gray-200 border rounded-l-md">
                  IVA
                </span>
                <span className="inline-flex items-center px-3 text-gray-900 bg-gray-100 border-t border-b">
                  %
                </span>
                <input
                  type="number"
                  name="iva"
                  value={formData.iva}
                  onChange={handleInputChange}
                  className="rounded-none rounded-r-lg border text-gray-900 block flex-1 min-w-0 w-full p-2.5"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-900 bg-gray-200 border rounded-l-md">
                  STOCK
                </span>
                <input
                  type="number"
                  name="stock_actual"
                  value={formData.stock_actual}
                  onChange={handleInputChange}
                  className="rounded-none rounded-r-lg border text-gray-900 block flex-1 min-w-0 w-full p-2.5"
                  min="0"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={handleSaveProduct}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
              >
                CREAR PRODUCTO
              </button>
              <button 
                onClick={resetForm}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
              >
                LIMPIAR DATOS
              </button>
            </div>
          </div>
        );
      case 'edit':
        return (
          <div className="w-full">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-bold">EDITAR PRODUCTO</h2>
              <p className="text-gray-600">MODIFIQUE LOS DATOS DEL PRODUCTO</p>
            </div>
            
            <div className="mb-4">
              <div className="flex">
                <input
                  type="text"
                  placeholder="BUSCAR POR NOMBRE O CATEGORIA"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-none rounded-l-lg border text-gray-900 block flex-1 min-w-0 w-full p-2.5"
                />
                <button 
                  onClick={handleSearch}
                  className="inline-flex items-center px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-r-md"
                >
                  BUSCAR
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-900 bg-gray-200 border rounded-l-md">
                  NOMBRE
                </span>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="rounded-none rounded-r-lg border text-gray-900 block flex-1 min-w-0 w-full p-2.5"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-900 bg-gray-200 border rounded-l-md">
                  CATEGORIA
                </span>
                <input
                  type="text"
                  name="categoria_id"
                  value={formData.categoria_id}
                  onChange={handleInputChange}
                  className="rounded-none rounded-r-lg border text-gray-900 block flex-1 min-w-0 w-full p-2.5"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-900 bg-gray-200 border rounded-l-md">
                  UNIDAD MEDIDA
                </span>
                <select
                  name="unidad_medida"
                  value={formData.unidad_medida}
                  onChange={handleInputChange}
                  className="rounded-none rounded-r-lg border text-gray-900 block flex-1 min-w-0 w-full p-2.5"
                >
                  <option value=""></option>
                  <option value="UNIDADES">UNIDADES</option>
                  <option value="LITROS">LITROS</option>
                </select>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-900 bg-gray-200 border rounded-l-md">
                  PRECIO COSTO
                </span>
                <span className="inline-flex items-center px-3 text-gray-900 bg-gray-100 border-t border-b">
                  $
                </span>
                <input
                  type="number"
                  name="costo"
                  value={formData.costo}
                  onChange={handleInputChange}
                  className="rounded-none rounded-r-lg border text-gray-900 block flex-1 min-w-0 w-full p-2.5"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-900 bg-gray-200 border rounded-l-md">
                  PRECIO VENTA
                </span>
                <span className="inline-flex items-center px-3 text-gray-900 bg-gray-100 border-t border-b">
                  $
                </span>
                <input
                  type="number"
                  name="precio"
                  value={formData.precio}
                  onChange={handleInputChange}
                  className="rounded-none rounded-r-lg border text-gray-900 block flex-1 min-w-0 w-full p-2.5"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-900 bg-gray-200 border rounded-l-md">
                  IVA
                </span>
                <span className="inline-flex items-center px-3 text-gray-900 bg-gray-100 border-t border-b">
                  %
                </span>
                <input
                  type="number"
                  name="iva"
                  value={formData.iva}
                  onChange={handleInputChange}
                  className="rounded-none rounded-r-lg border text-gray-900 block flex-1 min-w-0 w-full p-2.5"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-900 bg-gray-200 border rounded-l-md">
                  STOCK
                </span>
                <input
                  type="number"
                  name="stock_actual"
                  value={formData.stock_actual}
                  onChange={handleInputChange}
                  className="rounded-none rounded-r-lg border text-gray-900 block flex-1 min-w-0 w-full p-2.5"
                  min="0"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={handleSaveProduct}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
              >
                ACTUALIZAR PRODUCTO
              </button>
              <button 
                onClick={resetForm}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
              >
                LIMPIAR DATOS
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Head>
        <title>VERTIMAR | Productos</title>
        <meta name="description" content="Gestión de productos VERTIMAR" />
      </Head>
      
      <div className="flex flex-col md:flex-row w-full max-w-6xl bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Panel izquierdo */}
        <div className="w-full md:w-1/3 bg-blue-800 p-8 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-blue-300 mb-2">PRODUCTOS</h1>
          <p className="text-white mb-8">SELECCIONE UNA OPCIÓN</p>
          
          <div className="flex flex-col gap-4 w-full">
            <button 
              onClick={() => setSelectedOption('new')}
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded w-full"
            >
              NUEVO PRODUCTO
            </button>
            <button 
              onClick={() => setSelectedOption('edit')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-6 rounded w-full"
            >
              EDITAR PRODUCTO
            </button>
          </div>
        </div>
        
        {/* Panel derecho - formulario */}
        <div className={`w-full md:w-2/3 p-8 ${selectedOption ? 'block' : 'hidden md:block'}`}>
          {renderForm()}
        </div>
      </div>
      
      <Toaster position="top-right" />
      
      {/* Modal para resultados de búsqueda */}
      {modalIsOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Seleccionar Producto</h3>
            
            <div className="max-h-60 overflow-y-auto mb-4">
              {searchResults.length > 0 ? (
                searchResults.map((product, index) => (
                  <div 
                    key={index} 
                    className="p-2 border-b hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleResultClick(product)}
                  >
                    {product.nombre}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No se encontraron resultados</p>
              )}
            </div>
            
            <button 
              onClick={() => setModalIsOpen(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded w-full"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}