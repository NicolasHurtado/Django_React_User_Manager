import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Login from './pages/Login';
import Register from './pages/Register';
import ClientList from './pages/ClientList';
import ClientForm from './pages/ClientForm';
import ProjectList from './pages/ProjectList';
import ProjectForm from './pages/ProjectForm';
import { getToken, removeToken, isTokenExpired } from './services/auth';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar autenticación al cargar el componente
  useEffect(() => {
    const checkAuth = () => {
      const token = getToken();
      if (token) {
        // Verificar si el token no ha expirado
        if (!isTokenExpired(token)) {
          setIsAuthenticated(true);
        } else {
          // Si el token ha expirado, eliminarlo
          console.log('Token expirado, cerrando sesión');
          removeToken();
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    removeToken();
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return <div className="text-center mt-5">Cargando...</div>;
  }

  return (
    <Router>
      <Navigation isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <div className="container">
        <Routes>
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/clients" /> : <Login setIsAuthenticated={setIsAuthenticated} />} 
          />
          <Route 
            path="/register" 
            element={isAuthenticated ? <Navigate to="/clients" /> : <Register setIsAuthenticated={setIsAuthenticated} />} 
          />
          <Route 
            path="/clients" 
            element={isAuthenticated ? <ClientList /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/clients/new" 
            element={isAuthenticated ? <ClientForm /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/clients/edit/:id" 
            element={isAuthenticated ? <ClientForm /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/projects" 
            element={isAuthenticated ? <ProjectList /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/projects/new" 
            element={isAuthenticated ? <ProjectForm /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/projects/edit/:id" 
            element={isAuthenticated ? <ProjectForm /> : <Navigate to="/login" />} 
          />
          <Route path="/" element={<Navigate to={isAuthenticated ? "/clients" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 