import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from .factories import UserFactory, ClientFactory, ProjectFactory
import datetime
from django.utils import timezone

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def authenticated_client(api_client, user):
    url = reverse('token_obtain_pair')
    data = {
        'username': user.username,
        'password': 'password123'
    }
    response = api_client.post(url, data, format='json')
    token = response.data['access']
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    return api_client

@pytest.fixture
def user():
    return UserFactory()

@pytest.fixture
def client_instance(user):
    return ClientFactory(user=user)

@pytest.fixture
def project_data(client_instance):
    today = timezone.now().date()
    future_date = today + datetime.timedelta(days=30)
    return {
        'name': 'Proyecto Test',
        'description': 'Descripción del proyecto test',
        'status': 'pendiente',
        'client': client_instance.id,
        'start_date': today.isoformat(),
        'end_date': future_date.isoformat()
    }

@pytest.mark.django_db
class TestProjectEndpoints:
    """Pruebas para los endpoints de proyectos."""
    
    def test_create_project(self, authenticated_client, project_data):
        """Prueba la creación exitosa de un proyecto."""
        url = reverse('project-list')
        
        response = authenticated_client.post(url, project_data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['name'] == project_data['name']
        assert response.data['description'] == project_data['description']
        assert response.data['status'] == project_data['status']
        assert response.data['client'] == project_data['client']
    
    def test_get_projects_list(self, authenticated_client, user, client_instance):
        """Prueba obtener la lista de proyectos del usuario autenticado."""
        # Crear algunos proyectos para el cliente del usuario
        projects = [ProjectFactory(client=client_instance) for _ in range(3)]
        
        # Crear un proyecto para otro usuario (no debería aparecer en la respuesta)
        other_user = UserFactory()
        other_client = ClientFactory(user=other_user)
        ProjectFactory(client=other_client)
        
        url = reverse('project-list')
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 3
        project_ids = [project.id for project in projects]
        response_ids = [project['id'] for project in response.data]
        for project_id in project_ids:
            assert project_id in response_ids
    
    def test_get_project_detail(self, authenticated_client, client_instance):
        """Prueba obtener los detalles de un proyecto específico."""
        project = ProjectFactory(client=client_instance)
        
        url = reverse('project-detail', args=[project.id])
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == project.id
        assert response.data['name'] == project.name
        assert response.data['description'] == project.description
        assert response.data['status'] == project.status
        assert response.data['client'] == project.client.id
    
    def test_update_project(self, authenticated_client, client_instance):
        """Prueba actualizar un proyecto existente."""
        project = ProjectFactory(client=client_instance)
        
        url = reverse('project-detail', args=[project.id])
        updated_data = {
            'name': 'Proyecto Actualizado',
            'description': 'Descripción actualizada',
            'status': 'en_progreso',
            'client': client_instance.id,
            'start_date': project.start_date.isoformat(),
            'end_date': project.end_date.isoformat() if project.end_date else None
        }
        
        response = authenticated_client.put(url, updated_data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['name'] == updated_data['name']
        assert response.data['description'] == updated_data['description']
        assert response.data['status'] == updated_data['status']
    
    def test_delete_project(self, authenticated_client, client_instance):
        """Prueba eliminar un proyecto existente."""
        project = ProjectFactory(client=client_instance)
        
        url = reverse('project-detail', args=[project.id])
        response = authenticated_client.delete(url)
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Verificar que el proyecto ya no existe
        get_response = authenticated_client.get(url)
        assert get_response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_filter_projects_by_status(self, authenticated_client, client_instance):
        """Prueba filtrar proyectos por estado."""
        # Crear proyectos con diferentes estados
        pendiente_project = ProjectFactory(client=client_instance, status='pendiente')
        en_progreso_project = ProjectFactory(client=client_instance, status='en_progreso')
        completado_project = ProjectFactory(client=client_instance, status='completado')
        
        # Probar filtro para proyectos pendientes
        url = f"{reverse('project-by-status')}?status=pendiente"
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['id'] == pendiente_project.id
        
        # Probar filtro para proyectos en progreso
        url = f"{reverse('project-by-status')}?status=en_progreso"
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['id'] == en_progreso_project.id
        
        # Probar filtro para proyectos completados
        url = f"{reverse('project-by-status')}?status=completado"
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['id'] == completado_project.id
    
    def test_cannot_access_other_user_project(self, authenticated_client):
        """Prueba que un usuario no puede acceder a proyectos de otro usuario."""
        other_user = UserFactory()
        other_client = ClientFactory(user=other_user)
        other_project = ProjectFactory(client=other_client)
        
        url = reverse('project-detail', args=[other_project.id])
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND 