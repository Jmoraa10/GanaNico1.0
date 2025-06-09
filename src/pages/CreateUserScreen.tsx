import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

interface UserFormData {
  email: string;
  password: string;
  confirmPassword: string;
  role: 'admin' | 'capataz' | 'camionero';
  name: string;
}

const CreateUserScreen: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'capataz',
    name: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validaciones
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      if (formData.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Crear documento en Firestore
      await setDoc(doc(db, 'Users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: formData.email,
        name: formData.name,
        role: formData.role,
        createdAt: new Date().toISOString()
      });

      setSuccess('Usuario creado exitosamente');
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        role: 'capataz',
        name: ''
      });
    } catch (error: any) {
      console.error('Error al crear usuario:', error);
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('Este correo electrónico ya está en uso');
          break;
        case 'auth/invalid-email':
          setError('Correo electrónico inválido');
          break;
        case 'auth/weak-password':
          setError('La contraseña es demasiado débil');
          break;
        default:
          setError(error.message || 'Error al crear el usuario');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
          <div className="max-w-md mx-auto">
            <div className="flex items-center space-x-5">
              <div className="block pl-2 font-semibold text-xl text-gray-700">
                <h2 className="leading-relaxed">Crear Nuevo Usuario</h2>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <div className="flex flex-col">
                  <label className="leading-loose">Nombre Completo</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    placeholder="Nombre del usuario"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="leading-loose">Correo Electrónico</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="leading-loose">Contraseña</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    placeholder="••••••••"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="leading-loose">Confirmar Contraseña</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    placeholder="••••••••"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="leading-loose">Rol</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                  >
                    <option value="capataz">Capataz</option>
                    <option value="camionero">Camionero</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>
              {error && (
                <div className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded border border-red-200">
                  {error}
                </div>
              )}
              {success && (
                <div className="text-green-500 text-sm mb-4 bg-green-50 p-2 rounded border border-green-200">
                  {success}
                </div>
              )}
              <div className="pt-4 flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/home')}
                  className="flex justify-center items-center w-full text-gray-900 px-4 py-3 rounded-md focus:outline-none"
                >
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg> Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-500 flex justify-center items-center w-full text-white px-4 py-3 rounded-md focus:outline-none hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateUserScreen; 