import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from .factories import UserFactory, ClientFactory
import json

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
def client_data():
    return {
        'name': 'Cliente Test',
        'email': 'cliente@test.com',
        'phone': '+34123456789'
    }

@pytest.mark.django_db
class TestClientEndpoints:
    """Pruebas para los endpoints de clientes."""
    
    def test_create_client(self, authenticated_client, client_data, user):
        """Prueba la creación exitosa de un cliente."""
        url = reverse('client-list')
        
        response = authenticated_client.post(url, client_data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['name'] == client_data['name']
        assert response.data['email'] == client_data['email']
        assert response.data['phone'] == client_data['phone']
        assert response.data['user'] == user.id
    
    def test_get_clients_list(self, authenticated_client, user):
        """Prueba obtener la lista de clientes del usuario autenticado."""
        # Crear algunos clientes para el usuario
        clients = [ClientFactory(user=user) for _ in range(3)]
        # Crear un cliente para otro usuario (no debería aparecer en la respuesta)
        other_user = UserFactory()
        ClientFactory(user=other_user)
        
        url = reverse('client-list')
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 3
        client_ids = [client.id for client in clients]
        response_ids = [client['id'] for client in response.data]
        for client_id in client_ids:
            assert client_id in response_ids
    
    def test_get_client_detail(self, authenticated_client, user):
        """Prueba obtener los detalles de un cliente específico."""
        client = ClientFactory(user=user)
        
        url = reverse('client-detail', args=[client.id])
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == client.id
        assert response.data['name'] == client.name
        assert response.data['email'] == client.email
        assert response.data['phone'] == client.phone
    
    def test_update_client(self, authenticated_client, user):
        """Prueba actualizar un cliente existente."""
        client = ClientFactory(user=user)
        
        url = reverse('client-detail', args=[client.id])
        updated_data = {
            'name': 'Cliente Actualizado',
            'email': 'actualizado@test.com',
            'phone': '+34987654321'
        }
        
        response = authenticated_client.put(url, updated_data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['name'] == updated_data['name']
        assert response.data['email'] == updated_data['email']
        assert response.data['phone'] == updated_data['phone']
    
    def test_delete_client(self, authenticated_client, user):
        """Prueba eliminar un cliente existente."""
        client = ClientFactory(user=user)
        
        url = reverse('client-detail', args=[client.id])
        response = authenticated_client.delete(url)
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Verificar que el cliente ya no existe
        get_response = authenticated_client.get(url)
        assert get_response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_cannot_access_other_user_client(self, authenticated_client):
        """Prueba que un usuario no puede acceder a clientes de otro usuario."""
        other_user = UserFactory()
        other_client = ClientFactory(user=other_user)
        
        url = reverse('client-detail', args=[other_client.id])
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND 