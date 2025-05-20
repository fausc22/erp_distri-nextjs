import { useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import Head from 'next/head';
import useAuth from '../../hooks/useAuth';
import axios from 'axios';

export default function RegistrarGasto() {
  // Estados para el formulario
  const [formData, setFormData] = useState({
    descripcion: '',
    monto: '',
    formaPago: '',
    observaciones: '',
    comprobante: null
  });
  
  // Estado para mostrar el nombre del archivo seleccionado
  const [fileName, setFileName] = useState('');
  
  // Estado para el modal de confirmación de salida
  const [mostrarConfirmacionSalida, setMostrarConfirmacionSalida] = useState(false);
  
  // Verificar autenticación
  useAuth();
  
  // Opciones predefinidas
  const opcionesDescripcion = ['NAFTA', 'VIANDA', 'MANTENIMIENTO', 'REPARACION', 'ADELANTO'];
  const opcionesFormaPago = ['EFECTIVO', 'TRANSFERENCIA'];
  
  // Manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Si es campo de monto, validar que sea un número decimal válido
    if (name === 'monto') {
      // Permite números con hasta 2 decimales
      if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  // Manejar carga de archivos
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo (PDF o imágenes)
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (validTypes.includes(file.type)) {
        setFormData({ ...formData, comprobante: file });
        setFileName(file.name);
      } else {
        toast.error('El archivo debe ser un PDF o una imagen (JPG, PNG)');
        e.target.value = null;
      }
    }
  };
  
  // Registrar el gasto
  // Registrar el gasto
const handleSubmit = async () => {
  // Validar datos requeridos
  if (!formData.descripcion || !formData.monto || !formData.formaPago) {
    toast.error('Por favor complete los campos obligatorios: Descripción, Monto y Forma de Pago');
    return;
  }
  
  try {
    // Crear un FormData para enviar los datos, incluyendo el archivo
    const formDataToSend = new FormData();
    formDataToSend.append("descripcion", formData.descripcion);
    formDataToSend.append("monto", formData.monto);
    formDataToSend.append("formaPago", formData.formaPago);
    
    if (formData.observaciones) {
      formDataToSend.append("observaciones", formData.observaciones);
    }
    
    if (formData.comprobante) {
      formDataToSend.append("comprobante", formData.comprobante);
    }
    
    // Enviar todos los datos en una sola petición
    const response = await axios.post(
      'http://localhost:3001/compras/nuevo-gasto',
      formDataToSend,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    
    if (response.data.success) {
      toast.success(response.data.message || 'Gasto registrado con éxito');
      // Reiniciar el formulario después de un registro exitoso
      resetForm();
    } else {
      toast.error(response.data.message || 'Error al registrar el gasto');
    }
  } catch (error) {
    console.error('Error al registrar el gasto:', error);
    toast.error(error.response?.data?.message || 'Error al registrar el gasto');
  }
};
  
  // Limpiar formulario
  const resetForm = () => {
    setFormData({
      descripcion: '',
      monto: '',
      formaPago: '',
      observaciones: '',
      comprobante: null
    });
    setFileName('');
  };
  
  // Función para manejar el intento de salir
  const confirmarSalida = () => {
    // Verificar si hay datos que se perderían
    if (formData.descripcion || formData.monto || formData.formaPago || formData.observaciones || formData.comprobante) {
      setMostrarConfirmacionSalida(true);
    } else {
      // Si no hay datos, redirigir directamente
      window.location.href = '/';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Head>
        <title>VERTIMAR | Registrar Gasto</title>
        <meta name="description" content="Registro de gastos VERTIMAR" />
      </Head>
      
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Encabezado */}
        <div className="bg-blue-800 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">REGISTRAR GASTO</h1>
          <p className="text-blue-200 mt-2">Complete el formulario para registrar un nuevo gasto</p>
        </div>
        
        {/* Formulario */}
        <div className="p-6">
          {/* Descripción */}
          <div className="mb-6">
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción <span className="text-red-500">*</span>
            </label>
            <select
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              required
            >
              <option value="">Seleccione un tipo de gasto</option>
              {opcionesDescripcion.map((opcion, index) => (
                <option key={index} value={opcion}>{opcion}</option>
              ))}
            </select>
          </div>
          
          {/* Monto */}
          <div className="mb-6">
            <label htmlFor="monto" className="block text-sm font-medium text-gray-700 mb-2">
              Monto ($) <span className="text-red-500">*</span>
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                $
              </span>
              <input
                type="text"
                id="monto"
                name="monto"
                value={formData.monto}
                onChange={handleInputChange}
                className="rounded-none rounded-r-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full p-2.5"
                placeholder="0.00"
                required
              />
            </div>
          </div>
          
          {/* Forma de Pago */}
          <div className="mb-6">
            <label htmlFor="formaPago" className="block text-sm font-medium text-gray-700 mb-2">
              Forma de Pago <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-4">
              {opcionesFormaPago.map((opcion, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="radio"
                    id={`formaPago_${index}`}
                    name="formaPago"
                    value={opcion}
                    checked={formData.formaPago === opcion}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor={`formaPago_${index}`} className="ml-2 text-sm font-medium text-gray-900">
                    {opcion}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Observaciones */}
          <div className="mb-6">
            <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              id="observaciones"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleInputChange}
              rows="3"
              className="block p-2.5 w-full text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ingrese cualquier observación o detalle adicional"
            ></textarea>
          </div>
          
          {/* Cargar Comprobante */}
          <div className="mb-6">
            <label htmlFor="comprobante" className="block text-sm font-medium text-gray-700 mb-2">
              Comprobante
            </label>
            <div className="flex items-center justify-center w-full">
              <label htmlFor="comprobante" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Haga clic para cargar</span> o arrastre y suelte
                  </p>
                  <p className="text-xs text-gray-500">PDF, PNG o JPG (Máx. 10MB)</p>
                  {fileName && (
                    <p className="mt-2 text-sm text-blue-600 font-medium">{fileName}</p>
                  )}
                </div>
                <input 
                  id="comprobante" 
                  name="comprobante"
                  type="file" 
                  className="hidden" 
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </label>
            </div>
          </div>
          
          {/* Botones de acción */}
          <div className="flex flex-wrap justify-between gap-4 mt-8">
            <button 
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline min-w-[120px]"
            >
              REGISTRAR GASTO
            </button>
            
            <div className="flex gap-4">
              <button 
                onClick={resetForm}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
              >
                LIMPIAR FORMULARIO
              </button>
              
              <button 
                onClick={confirmarSalida}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
              >
                VOLVER AL MENÚ
              </button>
            </div>
          </div>
        </div>
      </div>
      
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