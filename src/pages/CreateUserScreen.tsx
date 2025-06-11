import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLogout } from '../hooks/useLogout';
import { sendPasswordReset } from '../services/authService';

interface UserFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone: string;
  role: 'admin' | 'capataz' | 'camionero';
}

interface User {
  uid: string;
  email: string;
  name: string;
  phone: string;
  role: 'admin' | 'capataz' | 'camionero';
  lastSignIn?: string;
}

const initialFormData: UserFormData = {
  email: '',
  password: '',
  confirmPassword: '',
  name: '',
  phone: '',
  role: 'capataz',
};

const CreateUserScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const logout = useLogout();

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    } else {
      setUsers([]);
      setError('Debes iniciar sesión para ver los usuarios.');
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'Users'));
      const usersList = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          uid: data.uid,
          email: data.email,
          name: data.name,
          phone: data.phone || '',
          role: data.role,
          lastSignIn: data.lastSignIn || '',
        } as User;
      });
      setUsers(usersList);
    } catch (error) {
      setError('Error al cargar los usuarios');
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      return;
    }
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'Users', uid));
      setUsers(users.filter(user => user.uid !== uid));
      setSuccess('Usuario eliminado exitosamente');
    } catch (error) {
      setError('Error al eliminar el usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const validate = () => {
    if (!formData.email || !formData.email.includes('@')) return 'Correo inválido';
    if (!formData.name) return 'El nombre es obligatorio';
    if (!formData.phone || !/^\d{7,15}$/.test(formData.phone)) return 'Teléfono inválido';
    if (!formData.password || formData.password.length < 6) return 'Contraseña muy corta';
    if (formData.password !== formData.confirmPassword) return 'Las contraseñas no coinciden';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const newUser = userCredential.user;
      await setDoc(doc(db, 'Users', newUser.uid), {
        uid: newUser.uid,
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        role: formData.role,
        createdAt: new Date().toISOString()
      });
      setSuccess('Usuario creado exitosamente');
      setFormData(initialFormData);
      fetchUsers();
    } catch (error: any) {
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
    <div
      className="min-h-screen w-full bg-cover bg-center flex flex-col justify-center items-center"
      style={{
        backgroundImage: "url('/assets/images/agregar.png')",
        backgroundBlendMode: 'overlay',
        backgroundColor: 'rgba(255,255,255,0.7)'
      }}
    >
      <div className="w-full max-w-lg mx-auto mt-10 mb-8 p-8 rounded-3xl shadow-2xl bg-white bg-opacity-80 backdrop-blur-md border border-gray-200">
        <h2 className="text-3xl font-bold text-center text-green-800 mb-6">Crear Nuevo Usuario</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Nombre Completo</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-300 focus:outline-none bg-white bg-opacity-90"
              placeholder="Nombre del usuario"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Correo Electrónico</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-300 focus:outline-none bg-white bg-opacity-90"
              placeholder="correo@ejemplo.com"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Teléfono</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-300 focus:outline-none bg-white bg-opacity-90"
              placeholder="Ej: 3001234567"
            />
          </div>
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-gray-700 font-semibold mb-1">Contraseña</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-300 focus:outline-none bg-white bg-opacity-90"
                placeholder="••••••••"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-gray-700 font-semibold mb-1">Confirmar Contraseña</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-300 focus:outline-none bg-white bg-opacity-90"
                placeholder="••••••••"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Rol</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-300 focus:outline-none bg-white bg-opacity-90"
            >
              <option value="capataz">Capataz</option>
              <option value="camionero">Camionero</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-2 text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="text-green-600 text-sm bg-green-50 border border-green-200 rounded-lg p-2 text-center">
              {success}
            </div>
          )}
          <div className="flex justify-between gap-4 mt-4">
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="w-1/2 py-2 rounded-lg border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold shadow-sm transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-1/2 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md transition disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>

      {/* Lista de Usuarios */}
      <div className="w-full max-w-4xl mx-auto mt-8 mb-10 p-6 rounded-2xl bg-white bg-opacity-90 shadow-xl border border-gray-200">
        <h3 className="text-2xl font-semibold text-green-800 mb-4 text-center">Usuarios Existentes</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-green-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Teléfono</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u.uid} className="text-center">
                  <td className="px-4 py-2">{u.name}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{u.phone}</td>
                  <td className="px-4 py-2">{u.role}</td>
                  <td className="px-4 py-2 flex flex-col gap-2 items-center">
                    <button
                      onClick={() => handleDeleteUser(u.uid)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-xs"
                    >
                      Eliminar
                    </button>
                    <button
                      onClick={async () => { await sendPasswordReset(u.email); alert('Correo de cambio de contraseña enviado'); }}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs"
                    >
                      Cambiar contraseña
                    </button>
                    <div className="text-xs text-gray-500 mt-1">Último ingreso: {u.lastSignIn || 'N/A'}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <button
        onClick={logout}
        className="fixed top-4 right-4 z-50 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl shadow-md"
      >
        Cerrar sesión
      </button>
    </div>
  );
};

export default CreateUserScreen; 