import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLogout } from '../hooks/useLogout';

interface UserFormData {
  email: string;
  password: string;
  confirmPassword: string;
  role: 'admin' | 'capataz' | 'camionero';
  name: string;
  phone: string;
}

interface UserRow {
  uid: string;
  email: string;
  name?: string;
  role: string;
  phone?: string;
  lastSignInTime?: string;
  creationTime?: string;
  disabled?: boolean;
}

const CreateUserScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState<UserRow[]>([]);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'capataz',
    name: '',
    phone: ''
  });
  const logout = useLogout();

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      navigate('/home');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    } else {
      setUsers([]);
      setError('Debes iniciar sesión para ver los usuarios.');
    }
    // eslint-disable-next-line
  }, [currentUser]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      // Obtener token del usuario admin
      const userData = localStorage.getItem('user');
      const token = userData ? JSON.parse(userData).token : null;
      if (!token) throw new Error('No hay token de autenticación');
      // Llamar al endpoint del backend
      const res = await fetch(`${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/auth/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) {
        throw new Error('No se pudo obtener la lista de usuarios');
      }
      const data = await res.json();
      // Mapear los datos para la tabla
      const usersList: UserRow[] = data.users.map((u: any) => ({
        uid: u.uid,
        email: u.email,
        name: u.displayName || '',
        phone: u.phoneNumber || '',
        lastSignInTime: u.metadata?.lastSignInTime,
        creationTime: u.metadata?.creationTime,
        disabled: u.disabled,
        role: '' // Se completará con Firestore abajo
      }));
      // Obtener roles y nombres desde Firestore
      const usersCollection = collection(db, 'Users');
      const usersSnapshot = await getDocs(usersCollection);
      const firestoreMap: Record<string, any> = {};
      usersSnapshot.docs.forEach(docu => {
        firestoreMap[docu.id] = docu.data();
      });
      // Mezclar datos de Auth y Firestore
      const mergedUsers = usersList.map(u => ({
        ...u,
        role: firestoreMap[u.uid]?.role || '',
        name: firestoreMap[u.uid]?.name || u.name,
        phone: firestoreMap[u.uid]?.phone || u.phone
      }));
      setUsers(mergedUsers);
    } catch (error: any) {
      setError(error.message || 'Error al cargar los usuarios');
    } finally {
      setLoading(false);
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
  };

  const handlePasswordReset = async (email: string) => {
    setError('');
    setSuccess('');
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('Correo de cambio de contraseña enviado');
    } catch (error: any) {
      setError('No se pudo enviar el correo de cambio de contraseña');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (!formData.name.trim()) throw new Error('El nombre es obligatorio');
      if (!formData.phone.trim()) throw new Error('El teléfono es obligatorio');
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }
      if (formData.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      await setDoc(doc(db, 'Users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: formData.email,
        name: formData.name,
        role: formData.role,
        phone: formData.phone,
        createdAt: new Date().toISOString()
      });
      setSuccess('Usuario creado exitosamente');
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        role: 'capataz',
        name: '',
        phone: ''
      });
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
        backgroundImage: "url('/agregar.png')",
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
              placeholder="Número de teléfono"
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
      <div className="w-full max-w-4xl mx-auto mb-10 p-6 rounded-3xl shadow-xl bg-white bg-opacity-90 backdrop-blur-md border border-gray-200">
        <h3 className="text-2xl font-semibold text-green-800 mb-4 text-center">Usuarios Existentes</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-green-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Teléfono</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Último Ingreso</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.uid}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.lastSignInTime ? new Date(user.lastSignInTime).toLocaleString() : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex gap-2">
                    <button
                      onClick={() => handlePasswordReset(user.email)}
                      className="text-blue-600 hover:text-blue-900 font-bold"
                      disabled={loading}
                    >
                      Cambiar Contraseña
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.uid)}
                      className="text-red-600 hover:text-red-900 font-bold"
                      disabled={loading}
                    >
                      Eliminar
                    </button>
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