from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User, HealthAssessment, Appointment, Consent, HealthGoal, 
    HealthActivity, IncentiveProgram, UserIncentive, Report, AuditLog
)

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'firstName', 'lastName', 'role', 'is_active', 'date_joined')
    list_filter = ('role', 'is_active', 'date_joined')
    search_fields = ('username', 'email', 'firstName', 'lastName')
    ordering = ('username',)
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('firstName', 'lastName', 'role')}),
    )

@admin.register(HealthAssessment)
class HealthAssessmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'height', 'weight', 'bloodPressureSystolic', 'bloodPressureDiastolic', 'createdAt')
    list_filter = ('createdAt', 'smokingStatus')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('createdAt',)

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'appointmentType', 'provider', 'date', 'status')
    list_filter = ('appointmentType', 'status', 'date')
    search_fields = ('user__username', 'provider')
    readonly_fields = ('createdAt', 'updatedAt')

@admin.register(Consent)
class ConsentAdmin(admin.ModelAdmin):
    list_display = ('user', 'consentType', 'granted', 'grantedAt', 'revokedAt')
    list_filter = ('consentType', 'granted', 'createdAt')
    search_fields = ('user__username',)
    readonly_fields = ('createdAt', 'updatedAt')

@admin.register(HealthGoal)
class HealthGoalAdmin(admin.ModelAdmin):
    list_display = ('user', 'goalType', 'description', 'targetValue', 'currentValue', 'status', 'progress_percentage')
    list_filter = ('goalType', 'status', 'createdAt')
    search_fields = ('user__username', 'description')
    readonly_fields = ('createdAt', 'updatedAt', 'progress_percentage')

@admin.register(HealthActivity)
class HealthActivityAdmin(admin.ModelAdmin):
    list_display = ('user', 'activityType', 'description', 'value', 'recordedAt')
    list_filter = ('activityType', 'recordedAt')
    search_fields = ('user__username', 'description')
    readonly_fields = ('createdAt',)

@admin.register(IncentiveProgram)
class IncentiveProgramAdmin(admin.ModelAdmin):
    list_display = ('name', 'isActive', 'startDate', 'endDate')
    list_filter = ('isActive', 'startDate', 'endDate')
    search_fields = ('name', 'description')

@admin.register(UserIncentive)
class UserIncentiveAdmin(admin.ModelAdmin):
    list_display = ('user', 'program', 'status', 'completedAt')
    list_filter = ('status', 'createdAt')
    search_fields = ('user__username', 'program__name')

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('name', 'reportType', 'generatedBy', 'createdAt')
    list_filter = ('reportType', 'createdAt')
    search_fields = ('name', 'generatedBy__username')

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'resource', 'resourceId', 'timestamp')
    list_filter = ('action', 'resource', 'timestamp')
    search_fields = ('user__username', 'resource', 'resourceId')
    readonly_fields = ('timestamp',)
    
    def has_add_permission(self, request):
        return False  # Prevent manual creation of audit logs
    
    def has_change_permission(self, request, obj=None):
        return False  # Prevent editing of audit logs