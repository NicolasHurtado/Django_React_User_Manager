import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Card, Alert, Badge, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { projectService } from '../services/api';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      let data;
      
      if (filterStatus) {
        data = await projectService.getByStatus(filterStatus);
      } else {
        data = await projectService.getAll();
      }
      
      setProjects(data);
      setError('');
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Error al cargar los proyectos. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este proyecto?')) {
      try {
        await projectService.delete(id);
        fetchProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
        setError('Error al eliminar el proyecto.');
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pendiente':
        return <Badge className="status-badge status-pendiente">Pendiente</Badge>;
      case 'en_progreso':
        return <Badge className="status-badge status-en_progreso">En Progreso</Badge>;
      case 'completado':
        return <Badge className="status-badge status-completado">Completado</Badge>;
      default:
        return <Badge className="status-badge">Desconocido</Badge>;
    }
  };

  // Función para formatear correctamente fechas ISO
  const formatDate = (dateString) => {
    if (!dateString) return 'No definida';
    
    // Aseguramos que la fecha se interprete correctamente sin ajustar zona horaria
    const parts = dateString.split('-');
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // Los meses en JS son 0-indexed
    const day = parseInt(parts[2]);
    
    return new Date(year, month, day).toLocaleDateString();
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Listado de Proyectos</h2>
        <Link to="/projects/new">
          <Button variant="primary">Nuevo Proyecto</Button>
        </Link>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card className="mb-4">
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label>Filtrar por Estado</Form.Label>
            <Form.Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_progreso">En Progreso</option>
              <option value="completado">Completado</option>
            </Form.Select>
          </Form.Group>
        </Card.Body>
      </Card>
      
      <Card>
        <Card.Body>
          {loading ? (
            <p className="text-center">Cargando proyectos...</p>
          ) : projects.length === 0 ? (
            <p className="text-center">No hay proyectos registrados.</p>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Cliente</th>
                  <th>Estado</th>
                  <th>Fecha de Inicio</th>
                  <th>Fecha de Entrega</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td>{project.name}</td>
                    <td>{project.client_name}</td>
                    <td>{getStatusBadge(project.status)}</td>
                    <td>{formatDate(project.start_date)}</td>
                    <td>{formatDate(project.end_date)}</td>
                    <td>
                      <Link to={`/projects/edit/${project.id}`} className="btn btn-sm btn-info me-2">
                        Editar
                      </Link>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => handleDelete(project.id)}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ProjectList; 