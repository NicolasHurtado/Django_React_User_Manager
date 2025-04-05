import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { register, login } from '../services/auth';
import { Link } from 'react-router-dom';

const Register = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validaciones básicas
    if (password !== passwordConfirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    setLoading(true);
    
    try {
      // Registrar el usuario
      await register(username, email, password);
      
      // Iniciar sesión automáticamente
      const loginData = await login(username, password);
      if (loginData) {
        setIsAuthenticated(true);
      } else {
        setError('Registro exitoso. Por favor inicie sesión.');
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (errorData.username) {
          setError(`Error de usuario: ${errorData.username.join(', ')}`);
        } else if (errorData.email) {
          setError(`Error de email: ${errorData.email.join(', ')}`);
        } else if (errorData.password) {
          setError(`Error de contraseña: ${errorData.password.join(', ')}`);
        } else {
          setError('Error al registrar el usuario.');
        }
      } else {
        setError('Error al registrar el usuario.');
      }
      console.error('Register error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2 className="form-title">Registro</h2>
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
        
        <Form.Group className="mb-3" controlId="formEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Ingrese su email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        
        <Form.Group className="mb-3" controlId="formPasswordConfirm">
          <Form.Label>Confirmar Contraseña</Form.Label>
          <Form.Control
            type="password"
            placeholder="Confirme su contraseña"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit" disabled={loading} className="w-100">
          {loading ? 'Cargando...' : 'Registrarse'}
        </Button>
      </Form>
      <div className="mt-3 text-center">
        ¿Ya tienes una cuenta? <Link to="/login">Inicia Sesión</Link>
      </div>
    </div>
  );
};

export default Register; 