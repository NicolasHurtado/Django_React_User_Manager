from django.contrib import admin
from .models import Client, Project

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'user', 'created_at')
    list_filter = ('user',)
    search_fields = ('name', 'email')

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'client', 'status', 'start_date', 'end_date')
    list_filter = ('status', 'client')
    search_fields = ('name', 'description') 