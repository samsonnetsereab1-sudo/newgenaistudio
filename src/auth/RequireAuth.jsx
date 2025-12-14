import { Navigate } from 'react-router-dom';

export default function RequireAuth({ children }) {
  const authed = localStorage.getItem('ng_beta_access') === 'true';
  return authed ? children : <Navigate to="/gate" replace />;
}
