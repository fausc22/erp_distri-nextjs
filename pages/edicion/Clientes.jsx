import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import Head from 'next/head';
import useAuth from '../../hooks/useAuth';

export default function Clientes() {
  const [selectedOption, setSelectedOption] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    condicion_iva: '',
    cuit: '',
    dni: '',
    direccion: '',
    ciudad: '',
    provincia: '',
    telefono: '',
    email: ''
  });
  
  useAuth();

  useEffect(() => {
    document.title = 'VERTIMAR | CLIENTES';
  }, []);

  const handleSearch = async () => {
    if (searchQuery.length >= 3) {
      try {
        const response = await axios.get(`http://localhost:3001/personas/buscar-cliente?search=${searchQuery}`);
        setSearchResults(response.data.data);
        setModalIsOpen(true);
      } catch (error) {
        console.error('Error al buscar cliente:', error);
        toast.error('Error al buscar cliente');
      }
    } else {
      toast.error('Ingrese al menos 3 caracteres para buscar');
    }
  };

  const handleResultClick = (client) => {
    setFormData({
      id: client.id,
      nombre: client.nombre,
      condicion_iva: client.condicion_iva,
      cuit: client.cuit,
      dni: client.dni,
      direccion: client.direccion,
      ciudad: client.ciudad,
      provincia: client.provincia,
      telefono: client.telefono,
      email: client.email
    });

    setSearchQuery('');
    setModalIsOpen(false);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveClient = async () => {
    try {
      if (formData.id) {
        await axios.put(`http://localhost:3001/personas/actualizar-cliente/${formData.id}`, formData);
        toast.success('Cliente actualizado correctamente');
      } else {
        await axios.post('http://localhost:3001/personas/crear-cliente', formData);
        toast.success('Cliente creado correctamente');
      }
    } catch (error) {
      toast.error('Error al guardar cliente');
      console.error(error);
    } finally {
      setFormData({
        nombre: '',
        condicion_iva: '',
        cuit: '',
        dni: '',
        direccion: '',
        ciudad: '',
        provincia: '',
        telefono: '',
        email: ''
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      condicion_iva: '',
      cuit: '',
      dni: '',
      direccion: '',
      ciudad: '',
      provincia: '',
      telefono: '',
      email: ''
    });
  };

  const renderForm = () => {
    switch (selectedOption) {
      case 'new':
        return (
          <div className="w-full">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-bold">NUEVO CLIENTE</h2>
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
                  CONDICION IVA
                </span>
                <select
                  name="condicion_iva"
                  value={formData.condicion_iva}
                  onChange={handleInputChange}
                  className="rounded-none rounded-r-lg border text-gray-900 block flex-1 min-w-0 w-full p-2.5"
                >
                  <option value="">SELECCIONE UNA CATEGORIA</option>
                  <option value="Responsable Inscripto">Responsable Inscripto</option>
                  <option value="Monotributo">Monotributo</option>
                  <option value="Consumidor Final">Consumidor Final</option>
                </select>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-900 bg-gray-200 border rounded-l-md">
                  CUIT
                </span>
                <input
                  type="text"
                  name="cuit"
                  value={formData.cuit}
                  onChange={handleInputChange}
                  className="rounded-none rounded-r-lg border text-gray-900 block flex-1 min-w-0 w-full p-2.5"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-900 bg-gray-200 border rounded-l-md">
                  DNI
                </span>
                <input
                  type="text"
                  name="dni"
                  value={formData.dni}
                  onChange={handleInputChange}
                  className="rounded-none rounded-r-lg border text-gray-900 block flex-1 min-w-0 w-full p-2.5"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-900 bg-gray-200 border rounded-l-md">
                  DIRECCION
                </span>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  className="rounded-none rounded-r-lg border text-gray-900 block flex-1 min-w-0 w-full p-2.5"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-900 bg-gray-200 border rounded-l-md">
                  CIUDAD
                </span>
                <input
                  type="text"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleInputChange}
                  className="rounded-none rounded-r-lg border text-gray-900 block flex-1 min-w-0 w-full p-2.5"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-900 bg-gray-200 border rounded-l-md">
                  PROVINCIA
                </span>
                <input
                  type="text"
                  name="provincia"
                  value={formData.provincia}
                  onChange={handleInputChange}
                  className="rounded-none rounded-r-lg border text-gray-900 block flex-1 min-w-0 w-full p-2.5"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-900 bg-gray-200 border rounded-l-md">
                  TELEFONO
                </span>
                <input
                  type="text"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className="rounded-none rounded-r-lg border text-gray-900 block flex-1 min-w-0 w-full p-2.5"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-900 bg-gray-200 border rounded-l-md">
                  EMAIL
                </span>
                <span className="inline-flex items-center px-3 text-gray-900 bg-gray-100 border-t border-b">
                  @
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="rounded-none rounded-r-lg border text-gray-900 block flex-1 min-w-0 w-full p-2.5"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={handleSaveClient}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
              >
                CREAR CLIENTE
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
              <h2 className="text-xl font-bold">EDITAR CLIENTE</h2>
              <p className="text-gray-600">MODIFIQUE LOS DATOS DEL CLIENTE</p>
            </div>
            
            <div className="mb-4">
              <div className="flex">
                <input
                  type="text"
                  placeholder="BUSCAR POR NOMBRE"
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
                  CONDICION IVA
                </span>
                <select
                  name="condicion_iva"
                  value={formData.condicion_iva}
                  onChange={handleInputChange}
                  className="rounded-none rounded-r-lg border text-gray-900 block flex-1 min-w-0 w-full p-2.5"
                >
                  <option value="">SELECCIONE UNA CATEGORIA</option>
                  <option value="Responsable Inscripto">Responsable Inscripto</option>
                  <option value="Monotributo">Monotributo</option>
                  <option value="Consumidor Final">Consumidor Final</option>
                </select>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-900 bg-gray-200 border rounded-l-md">
                  CUIT
                </span>
                <input
                  type="text"
                  name="cuit"
                  value={formData.cuit}
                  onChange={handleInputChange}
                  className="rounded-none rounded-r-lg border text-gray-900 block flex-1 min-w-0 w-full p-2.5"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-900 bg-gray-200 border rounded-l-md">
                  DNI
                </span>
                <input
                  type="text"
                  name="dni"
                  value={formData.dni}
                  onChange={handleInputChange}
                  className="rounded-none rounded-r-lg border text-gray-900 block flex-1 min-w-0 w-full p-2.5"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-900 bg-gray-200 border rounded-l-md">
                  DIRECCION
                </span>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  className="rounded-none rounded-r-lg border text-gray-900 block flex-1 min-w-0 w-full p-2.5"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-900 bg-gray-200 border rounded-l-md">
                  CIUDAD
                </span>
                <input
                  type="text"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleInputChange}
                  className="rounded-none rounded-r-lg border text-gray-900 block flex-1 min-w-0 w-full p-2.5"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-900 bg-gray-200 border rounded-l-md">
                  PROVINCIA
                </span>
                <input
                  type="text"
                  name="provincia"
                  value={formData.provincia}
                  onChange={handleInputChange}
                  className="rounded-none rounded-r-lg border text-gray-900 block flex-1 min-w-0 w-full p-2.5"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-900 bg-gray-200 border rounded-l-md">
                  TELEFONO
                </span>
                <input
                  type="text"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className="rounded-none rounded-r-lg border text-gray-900 block flex-1 min-w-0 w-full p-2.5"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-900 bg-gray-200 border rounded-l-md">
                  EMAIL
                </span>
                <span className="inline-flex items-center px-3 text-gray-900 bg-gray-100 border-t border-b">
                  @
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="rounded-none rounded-r-lg border text-gray-900 block flex-1 min-w-0 w-full p-2.5"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={handleSaveClient}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
              >
                ACTUALIZAR CLIENTE
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
        <title>VERTIMAR | Clientes</title>
        <meta name="description" content="Gestión de clientes VERTIMAR" />
      </Head>
      
      <div className="flex flex-col md:flex-row w-full max-w-6xl bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Panel izquierdo */}
        <div className="w-full md:w-1/3 bg-blue-800 p-8 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-blue-300 mb-2">CLIENTES</h1>
          <p className="text-white mb-8">SELECCIONE UNA OPCIÓN</p>
          
          <div className="flex flex-col gap-4 w-full">
            <button 
              onClick={() => setSelectedOption('new')}
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded w-full"
            >
              NUEVO CLIENTE
            </button>
            <button 
              onClick={() => setSelectedOption('edit')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-6 rounded w-full"
            >
              EDITAR CLIENTE
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
            <h3 className="text-xl font-bold mb-4">Seleccionar Cliente</h3>
            
            <div className="max-h-60 overflow-y-auto mb-4">
              {searchResults.length > 0 ? (
                searchResults.map((client, index) => (
                  <div 
                    key={index} 
                    className="p-2 border-b hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleResultClick(client)}
                  >
                    {client.nombre}
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