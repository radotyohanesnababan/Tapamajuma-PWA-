// GuestGuard.jsx
import { Navigate } from 'react-router-dom';

export default function GuestGuard({ children }) {
  const token = localStorage.getItem('auth_token');
  
  // Ambil role dari localStorage (Pastikan saat login role juga disimpan di storage)
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  const role = userData.role;

  if (token) {
    // Jika sudah ada token, langsung tendang sesuai role tanpa ampun
    console.log("User sudah login, GuestGuard menendang balik...");
    
    if (role === 'teacher') return <Navigate to="/teacher" replace />;
    if (role === 'superadmin') return <Navigate to="/superadmin" replace />;
    return <Navigate to="/student" replace />;
  }

  return children;
}