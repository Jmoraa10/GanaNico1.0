import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useNavigate } from 'react-router-dom';

export function useLogout() {
  const navigate = useNavigate();
  return async () => {
    await signOut(auth);
    localStorage.removeItem('user');
    navigate('/login');
  };
} 