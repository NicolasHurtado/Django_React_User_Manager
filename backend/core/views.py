from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth.models import User
from .models import Client, Project
from .serializers import UserSerializer, ClientSerializer, ProjectSerializer
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiExample

@extend_schema_view(
    list=extend_schema(
        summary="Listar usuarios",
        description="Obtiene una lista de todos los usuarios registrados. Solo accesible para usuarios autenticados.",
        tags=["Autenticación"]
    ),
    create=extend_schema(
        summary="Registrar usuario",
        description="Registra un nuevo usuario en el sistema.",
        tags=["Autenticación"]
    ),
    retrieve=extend_schema(
        summary="Obtener usuario",
        description="Obtiene la información de un usuario específico por su ID.",
        tags=["Autenticación"]
    ),
    update=extend_schema(
        summary="Actualizar usuario",
        description="Actualiza la información de un usuario específico por su ID.",
        tags=["Autenticación"]
    ),
    destroy=extend_schema(
        summary="Eliminar usuario",
        description="Elimina un usuario específico por su ID.",
        tags=["Autenticación"]
    ),
)
class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar usuarios.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]  # Solo para registro, luego se protegen otras acciones
    
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

@extend_schema_view(
    list=extend_schema(
        summary="Listar clientes",
        description="Obtiene una lista de todos los clientes asociados al usuario autenticado.",
        tags=["Clientes"]
    ),
    create=extend_schema(
        summary="Crear cliente",
        description="Crea un nuevo cliente asociado al usuario autenticado.",
        tags=["Clientes"]
    ),
    retrieve=extend_schema(
        summary="Obtener cliente",
        description="Obtiene la información de un cliente específico por su ID.",
        tags=["Clientes"]
    ),
    update=extend_schema(
        summary="Actualizar cliente",
        description="Actualiza la información de un cliente específico por su ID.",
        tags=["Clientes"]
    ),
    destroy=extend_schema(
        summary="Eliminar cliente",
        description="Elimina un cliente específico por su ID.",
        tags=["Clientes"]
    ),
)
class ClientViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar clientes.
    """
    serializer_class = ClientSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Solo devolver clientes del usuario actual
        return Client.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # Asignar automáticamente el usuario actual al crear un cliente
        serializer.save(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        # Añadir usuario a los datos de la solicitud
        # Este enfoque es más explícito y evita errores de validación
        data = request.data.copy()
        data['user'] = request.user.id
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

@extend_schema_view(
    list=extend_schema(
        summary="Listar proyectos",
        description="Obtiene una lista de todos los proyectos asociados a los clientes del usuario autenticado.",
        tags=["Proyectos"]
    ),
    create=extend_schema(
        summary="Crear proyecto",
        description="Crea un nuevo proyecto asociado a un cliente del usuario autenticado.",
        tags=["Proyectos"]
    ),
    retrieve=extend_schema(
        summary="Obtener proyecto",
        description="Obtiene la información de un proyecto específico por su ID.",
        tags=["Proyectos"]
    ),
    update=extend_schema(
        summary="Actualizar proyecto",
        description="Actualiza la información de un proyecto específico por su ID.",
        tags=["Proyectos"]
    ),
    destroy=extend_schema(
        summary="Eliminar proyecto",
        description="Elimina un proyecto específico por su ID.",
        tags=["Proyectos"]
    ),
    by_status=extend_schema(
        summary="Filtrar proyectos por estado",
        description="Obtiene una lista de proyectos filtrados por su estado (pendiente, en_progreso, completado).",
        parameters=[
            OpenApiParameter(
                name="status", 
                description="Estado del proyecto", 
                required=True, 
                type=str,
                enum=["pendiente", "en_progreso", "completado"]
            ),
        ],
        tags=["Proyectos"]
    ),
)
class ProjectViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar proyectos.
    """
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Solo devolver proyectos de clientes del usuario actual
        return Project.objects.filter(client__user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def by_status(self, request):
        """Endpoint para filtrar proyectos por estado"""
        status_param = request.query_params.get('status', None)
        if status_param:
            projects = self.get_queryset().filter(status=status_param)
            serializer = self.get_serializer(projects, many=True)
            return Response(serializer.data)
        return Response({'error': 'Se requiere el parámetro status'}, status=status.HTTP_400_BAD_REQUEST) 