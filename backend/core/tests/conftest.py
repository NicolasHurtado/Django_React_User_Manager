import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from .factories import UserFactory, ClientFactory, ProjectFactory

@pytest.fixture
def api_client():
    """
    Fixture que proporciona un cliente API para las pruebas.
    """
    return APIClient()

@pytest.fixture
def user():
    """
    Fixture que crea un usuario para las pruebas.
    """
    return UserFactory()

@pytest.fixture
def authenticated_client(api_client, user):
    """
    Fixture que proporciona un cliente API autenticado con token JWT.
    """
    url = reverse('token_obtain_pair')
    data = {
        'username': user.username,
        'password': 'password123'
    }
    response = api_client.post(url, data, format='json')
    token = response.data['access']
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    return api_client 