import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService, clientService } from '../services/api';

const ProjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'pendiente',
    client: '',
    start_date: '',
    end_date: '',
  });
  
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetchingData, setFetchingData] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingData(true);
        
        // Obtener lista de clientes
        const clientsData = await clientService.getAll();
        setClients(clientsData);
        
        // Si estamos en modo edición, obtener datos del proyecto
        if (isEditMode) {
          const projectData = await projectService.get(id);
          
          // Aseguramos que las fechas se muestren correctamente (solo la parte de fecha)
          const formatDateForInput = (dateString) => {
            if (!dateString) return '';
            return dateString.split('T')[0];
          };
          
          setFormData({
            name: projectData.name,
            description: projectData.description,
            status: projectData.status,
            client: projectData.client,
            start_date: formatDateForInput(projectData.start_date),
            end_date: formatDateForInput(projectData.end_date),
          });
        } else if (clientsData.length > 0) {
          // Si hay clientes, seleccionar el primero por defecto
          setFormData(prev => ({
            ...prev,
            client: clientsData[0].id
          }));
        }
        
        setError('');
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error al cargar los datos. Intente nuevamente.');
      } finally {
        setFetchingData(false);
      }
    };
    
    fetchData();
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
      // Aseguramos que las fechas se envíen en formato ISO
      const dataToSend = {
        ...formData
      };
      
      if (isEditMode) {
        await projectService.update(id, dataToSend);
      } else {
        await projectService.create(dataToSend);
      }
      navigate('/projects');
    } catch (error) {
      console.error('Error saving project:', error);
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        const errorMessages = [];
        
        for (const key in errorData) {
          errorMessages.push(`${key}: ${errorData[key].join(', ')}`);
        }
        
        setError(`Error: ${errorMessages.join('; ')}`);
      } else {
        setError('Error al guardar el proyecto. Intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  if (fetchingData) {
    return <p className="text-center mt-5">Cargando datos...</p>;
  }
  
  if (clients.length === 0) {
    return (
      <div className="text-center mt-5">
        <Alert variant="warning">
          No hay clientes disponibles. Primero debe crear al menos un cliente.
        </Alert>
        <Button variant="primary" onClick={() => navigate('/clients/new')}>
          Crear Cliente
        </Button>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="mb-4">{isEditMode ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h2>
      
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
                placeholder="Ingrese el nombre del proyecto"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="formDescription">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Ingrese la descripción del proyecto"
                rows={3}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="formStatus">
              <Form.Label>Estado</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_progreso">En Progreso</option>
                <option value="completado">Completado</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="formClient">
              <Form.Label>Cliente</Form.Label>
              <Form.Select
                name="client"
                value={formData.client}
                onChange={handleChange}
                required
              >
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="formStartDate">
              <Form.Label>Fecha de Inicio</Form.Label>
              <Form.Control
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="formEndDate">
              <Form.Label>Fecha de Entrega</Form.Label>
              <Form.Control
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
              />
            </Form.Group>
            
            <div className="d-flex gap-2">
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
              <Button variant="secondary" onClick={() => navigate('/projects')}>
                Cancelar
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ProjectForm; 