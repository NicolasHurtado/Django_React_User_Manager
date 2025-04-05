import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { login } from '../services/auth';
import { Link } from 'react-router-dom';

const Login = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(username, password);
      if (data && data.access) {
        setIsAuthenticated(true);
      } else {
        setError('Error al iniciar sesión. Verifique sus credenciales.');
        // Importante: no hacemos más llamadas a la API si la autenticación falló
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        if (error.response.status === 401) {
          setError('Credenciales incorrectas. Por favor, verifique su usuario y contraseña.');
        } else if (error.response.data && error.response.data.detail) {
          setError(`Error: ${error.response.data.detail}`);
        } else {
          setError('Error al iniciar sesión. Intente nuevamente.');
        }
      } else {
        setError('Error de conexión. Verifique su conexión a internet e intente nuevamente.');
      }
      // Asegurarnos de no estar autenticados
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2 className="form-title">Iniciar Sesión</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formUsername">
          <Form.Label>Usuario</Form.Label>
          <Form.Control
            type="text"
            placeholder="Ingrese su usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formPassword">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control
            type="password"
            placeholder="Ingrese su contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit" disabled={loading} className="w-100">
          {loading ? 'Cargando...' : 'Iniciar Sesión'}
        </Button>
      </Form>
      <div className="mt-3 text-center">
        ¿No tienes una cuenta? <Link to="/register">Regístrate</Link>
      </div>
    </div>
  );
};

export default Login; 