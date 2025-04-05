import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { clientService } from '../services/api';

const ClientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetchingClient, setFetchingClient] = useState(isEditMode);
  
  useEffect(() => {
    const fetchClient = async () => {
      try {
        if (isEditMode) {
          setFetchingClient(true);
          const data = await clientService.get(id);
          setFormData({
            name: data.name,
            email: data.email,
            phone: data.phone,
          });
          setError('');
        }
      } catch (error) {
        console.error('Error fetching client:', error);
        setError('Error al cargar los datos del cliente.');
      } finally {
        setFetchingClient(false);
      }
    };
    
    fetchClient();
  }, [id, isEditMode]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isEditMode) {
        await clientService.update(id, formData);
      } else {
        await clientService.create(formData);
      }
      navigate('/clients');
    } catch (error) {
      console.error('Error saving client:', error);
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        const errorMessages = [];
        
        for (const key in errorData) {
          if (typeof errorData[key] === 'string') {
            errorMessages.push(`${key}: ${errorData[key]}`);
          } else if (Array.isArray(errorData[key])) {
            errorMessages.push(`${key}: ${errorData[key].join(', ')}`);
          }
        }
        
        setError(`Error: ${errorMessages.join('; ')}`);
      } else {
        setError('Error al guardar el cliente. Intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  if (fetchingClient) {
    return <p className="text-center mt-5">Cargando datos del cliente...</p>;
  }
  
  return (
    <div>
      <h2 className="mb-4">{isEditMode ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formName">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ingrese el nombre del cliente"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Ingrese el email del cliente"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="formPhone">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Ingrese el teléfono del cliente"
                required
              />
            </Form.Group>
            
            <div className="d-flex gap-2">
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
              <Button variant="secondary" onClick={() => navigate('/clients')}>
                Cancelar
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ClientForm; 