from django.urls import path
from . import views

urlpatterns = [
    # Authentication endpoints
    path('api/register/', views.register, name='register'),
    path('api/login/', views.login, name='login'),
    path('api/logout/', views.logout, name='logout'),
    path('api/user/', views.current_user, name='current_user'),
    
    # Health Assessment endpoints
    path('api/health-assessments/', views.HealthAssessmentListCreateView.as_view(), name='health_assessments'),
    path('api/health-assessments/<int:pk>/', views.HealthAssessmentDetailView.as_view(), name='health_assessment_detail'),
    
    # Appointment endpoints
    path('api/appointments/', views.AppointmentListCreateView.as_view(), name='appointments'),
    path('api/appointments/<int:pk>/', views.AppointmentDetailView.as_view(), name='appointment_detail'),
    
    # Consent endpoints
    path('api/consents/', views.ConsentListCreateView.as_view(), name='consents'),
    path('api/consents/<int:pk>/', views.ConsentDetailView.as_view(), name='consent_detail'),
    
    # Health Goal endpoints
    path('api/health-goals/', views.HealthGoalListCreateView.as_view(), name='health_goals'),
    path('api/health-goals/<int:pk>/', views.HealthGoalDetailView.as_view(), name='health_goal_detail'),
    
    # Health Activity endpoints
    path('api/health-activities/', views.HealthActivityListCreateView.as_view(), name='health_activities'),
    
    # Corporate endpoints
    path('api/corporate/metrics/', views.corporate_metrics, name='corporate_metrics'),
    path('api/corporate/department-metrics/', views.department_metrics, name='department_metrics'),
    path('api/corporate/recent-activities/', views.recent_activities, name='recent_activities'),
    
    # Report endpoints
    path('api/reports/', views.ReportListCreateView.as_view(), name='reports'),
    
    # Audit endpoints
    path('api/audit-log/', views.AuditLogListView.as_view(), name='audit_log'),
    path('api/audit-log/user/', views.user_audit_log, name='user_audit_log'),
]