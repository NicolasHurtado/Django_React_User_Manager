import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from .factories import UserFactory

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def user():
    return UserFactory()

@pytest.mark.django_db
class TestAuthentication:
    """Pruebas para la autenticación de usuarios."""
    
    def test_user_registration(self, api_client):
        """Prueba el registro exitoso de un usuario."""
        url = reverse('user-list')
        data = {
            'username': 'nuevouser',
            'email': 'nuevo@example.com',
            'password': 'contraseña123'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert 'id' in response.data
        assert 'username' in response.data
        assert response.data['username'] == 'nuevouser'
        assert response.data['email'] == 'nuevo@example.com'
        assert 'password' not in response.data  # Aseguramos que no se devuelve la contraseña
    
    def test_token_obtain(self, api_client, user):
        """Prueba la obtención de tokens JWT."""
        url = reverse('token_obtain_pair')
        data = {
            'username': user.username,
            'password': 'password123'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data
    
    def test_token_refresh(self, api_client, user):
        """Prueba el refresco de tokens JWT."""
        # Primero obtenemos un token
        obtain_url = reverse('token_obtain_pair')
        data = {
            'username': user.username,
            'password': 'password123'
        }
        
        obtain_response = api_client.post(obtain_url, data, format='json')
        refresh_token = obtain_response.data['refresh']
        
        # Luego refrescamos el token
        refresh_url = reverse('token_refresh')
        refresh_data = {
            'refresh': refresh_token
        }
        
        refresh_response = api_client.post(refresh_url, refresh_data, format='json')
        
        assert refresh_response.status_code == status.HTTP_200_OK
        assert 'access' in refresh_response.data
    
    def test_unauthorized_access(self, api_client):
        """Prueba el acceso no autorizado a endpoints protegidos."""
        # Intentamos acceder a un endpoint protegido sin autenticación
        url = reverse('client-list')
        
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED 