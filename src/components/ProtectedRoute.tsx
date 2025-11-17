import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    const isAuth = localStorage.getItem('adminAuth');
    if (!isAuth) {
      navigate('/login');
    }
  }, [navigate]);

  const isAuth = localStorage.getItem('adminAuth');
  
  if (!isAuth) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
