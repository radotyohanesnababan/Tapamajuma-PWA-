import { Navigate } from 'react-router-dom';

export default function GuestGuard({ children }) {
  const token = localStorage.getItem('auth_token');
  
  // Ambil data user dari storage (pastikan saat login kamu menyimpannya)
  const user = JSON.parse(localStorage.getItem('user_data') || '{}');

  if (token) {
    // 1. Jika role belum ada tapi token ada (kasus user baru yang belum onboarding)
    if (!user.role) {
      return <Navigate to="/social-callback?needs_onboarding=true" replace />;
    }

    // 2. Lempar ke dashboard sesuai role masing-masing
    if (user.role === 'teacher') return <Navigate to="/teacher" replace />;
    if (user.role === 'superadmin') return <Navigate to="/superadmin" replace />;
    
    // Default untuk student
    return <Navigate to="/student" replace />;
  }

  // Jika tidak ada token, biarkan user akses halaman Login/Welcome
  return children;
}