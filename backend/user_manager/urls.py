from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from drf_spectacular.utils import extend_schema

# Extender los esquemas para los endpoints de JWT
class ExtendedTokenObtainPairView(TokenObtainPairView):
    @extend_schema(
        summary="Obtener token JWT",
        description="Obtiene un par de tokens de acceso y refresco al proporcionar credenciales válidas.",
        tags=["Autenticación"],
        responses={
            200: {
                "type": "object",
                "properties": {
                    "access": {"type": "string", "description": "Token de acceso JWT"},
                    "refresh": {"type": "string", "description": "Token de refresco para obtener nuevos tokens de acceso"}
                }
            }
        }
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

class ExtendedTokenRefreshView(TokenRefreshView):
    @extend_schema(
        summary="Refrescar token JWT",
        description="Obtiene un nuevo token de acceso utilizando un token de refresco válido.",
        tags=["Autenticación"],
        responses={
            200: {
                "type": "object",
                "properties": {
                    "access": {"type": "string", "description": "Nuevo token de acceso JWT"}
                }
            }
        }
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Authentication endpoints
    path('api/token/', ExtendedTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', ExtendedTokenRefreshView.as_view(), name='token_refresh'),
    
    # API endpoints
    path('api/', include('core.urls')),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
] 