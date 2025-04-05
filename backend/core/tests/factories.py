import factory
from django.contrib.auth.models import User
from core.models import Client, Project
from factory.django import DjangoModelFactory
from django.utils import timezone
import datetime

class UserFactory(DjangoModelFactory):
    class Meta:
        model = User
    
    username = factory.Sequence(lambda n: f'usuario{n}')
    email = factory.LazyAttribute(lambda obj: f'{obj.username}@example.com')
    password = factory.PostGenerationMethodCall('set_password', 'password123')
    is_active = True

class ClientFactory(DjangoModelFactory):
    class Meta:
        model = Client
    
    name = factory.Sequence(lambda n: f'Cliente {n}')
    email = factory.LazyAttribute(lambda obj: f'{obj.name.lower().replace(" ", "")}@example.com')
    phone = factory.Sequence(lambda n: f'+34912345{n:03d}')
    user = factory.SubFactory(UserFactory)
    created_at = factory.LazyFunction(timezone.now)
    updated_at = factory.LazyFunction(timezone.now)

class ProjectFactory(DjangoModelFactory):
    class Meta:
        model = Project
    
    name = factory.Sequence(lambda n: f'Proyecto {n}')
    description = factory.LazyAttribute(lambda obj: f'Descripción para {obj.name}')
    status = factory.Iterator(['pendiente', 'en_progreso', 'completado'])
    client = factory.SubFactory(ClientFactory)
    start_date = factory.LazyFunction(lambda: timezone.now().date())
    end_date = factory.LazyFunction(lambda: (timezone.now() + datetime.timedelta(days=30)).date())
    created_at = factory.LazyFunction(timezone.now)
    updated_at = factory.LazyFunction(timezone.now) 