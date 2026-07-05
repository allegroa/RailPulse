import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, roles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role'); // Assicurati che il ruolo sia salvato qui

  if (!token) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(role)) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;