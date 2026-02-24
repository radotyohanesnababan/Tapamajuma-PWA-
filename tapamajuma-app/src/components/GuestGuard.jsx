import { Navigate } from 'react-router-dom';

export default function GuestGuard({ children }) {
  const token = localStorage.getItem('auth_token');
  
  // Gunakan try-catch agar jika localStorage rusak/kosong, web tidak putih total
  let user = {};
  try {
    const storedUser = localStorage.getItem('user_data');
    user = storedUser ? JSON.parse(storedUser) : {};
  } catch (e) {
    user = {};
  }

  if (token) {
    // Jika role belum terdeteksi, biarkan dia masuk dulu ke dashboard student (fallback)
    const role = user?.role;
    if (role === 'teacher') return <Navigate to="/teacher" replace />;
    if (role === 'superadmin') return <Navigate to="/superadmin" replace />;
    return <Navigate to="/student" replace />;
  }

  return children;
}