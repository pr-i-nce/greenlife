import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const accessToken = useSelector((state) => state.auth.accessToken);
  return accessToken ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;
