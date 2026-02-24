// Buat file baru atau taruh di atas App()
import { Navigate } from 'react-router-dom';

const GuestGuard = ({ children }) => {
  const token = localStorage.getItem('auth_token');
  const user = JSON.parse(localStorage.getItem('user_data') || '{}');

  if (token) {
    // Jika sudah login, tendang ke dashboard sesuai role
    if (user.role === 'teacher') return <Navigate to="/teacher" replace />;
    if (user.role === 'superadmin') return <Navigate to="/superadmin" replace />;
    return <Navigate to="/student" replace />;
  }

  return children;
};