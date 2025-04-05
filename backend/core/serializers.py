from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Client, Project
from drf_spectacular.utils import extend_schema_field, extend_schema_serializer

class UserSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo de Usuario.
    """
    password = serializers.CharField(
        write_only=True,
        help_text="Contraseña del usuario. Solo escritura."
    )
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        help_texts = {
            'username': 'Nombre de usuario único',
            'email': 'Correo electrónico',
        }
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user

@extend_schema_serializer(
    component_name="Cliente"
)
class ClientSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo de Cliente.
    Facilita la gestión de datos de clientes en la API.
    """
    class Meta:
        model = Client
        fields = ('id', 'name', 'email', 'phone', 'user', 'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at')
        extra_kwargs = {
            'user': {'required': False, 'help_text': 'ID del usuario propietario del cliente'},
            'name': {'help_text': 'Nombre del cliente'},
            'email': {'help_text': 'Correo electrónico del cliente'},
            'phone': {'help_text': 'Número de teléfono del cliente'},
            'created_at': {'help_text': 'Fecha de creación (solo lectura)'},
            'updated_at': {'help_text': 'Fecha de última actualización (solo lectura)'},
        }
    
    def validate_email(self, value):
        """
        Validar que el email tenga un formato correcto.
        """
        if not value:
            raise serializers.ValidationError("El email es obligatorio.")
        return value
    
    def validate_phone(self, value):
        """
        Validar que el teléfono tenga un formato correcto.
        """
        if not value:
            raise serializers.ValidationError("El teléfono es obligatorio.")
        return value

@extend_schema_serializer(
    component_name="Proyecto"
)
class ProjectSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo de Proyecto.
    Facilita la gestión de datos de proyectos en la API.
    """
    client_name = serializers.ReadOnlyField(
        source='client.name',
        help_text="Nombre del cliente asociado al proyecto (solo lectura)"
    )
    
    class Meta:
        model = Project
        fields = (
            'id', 'name', 'description', 'status', 'client', 'client_name',
            'start_date', 'end_date', 'created_at', 'updated_at'
        )
        read_only_fields = ('created_at', 'updated_at')
        extra_kwargs = {
            'name': {'help_text': 'Nombre del proyecto'},
            'description': {'help_text': 'Descripción detallada del proyecto'},
            'status': {'help_text': 'Estado del proyecto (pendiente, en_progreso, completado)'},
            'client': {'help_text': 'ID del cliente asociado al proyecto'},
            'start_date': {'help_text': 'Fecha de inicio del proyecto (YYYY-MM-DD)'},
            'end_date': {'help_text': 'Fecha de finalización del proyecto (YYYY-MM-DD, opcional)'},
            'created_at': {'help_text': 'Fecha de creación (solo lectura)'},
            'updated_at': {'help_text': 'Fecha de última actualización (solo lectura)'},
        } 