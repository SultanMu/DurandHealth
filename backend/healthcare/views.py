from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Count, Avg
from django.utils import timezone
from datetime import datetime, timedelta
from .models import (
    User, HealthAssessment, Appointment, Consent, 
    HealthGoal, HealthActivity, IncentiveProgram, 
    UserIncentive, Report, AuditLog
)
from .serializers import (
    UserSerializer, UserCreateSerializer, LoginSerializer,
    HealthAssessmentSerializer, AppointmentSerializer, ConsentSerializer,
    HealthGoalSerializer, HealthActivitySerializer, IncentiveProgramSerializer,
    UserIncentiveSerializer, ReportSerializer, AuditLogSerializer
)

def log_audit(user, action, resource, resource_id=None, request=None):
    """Helper function to log audit events"""
    ip_address = request.META.get('REMOTE_ADDR', '127.0.0.1') if request else '127.0.0.1'
    user_agent = request.META.get('HTTP_USER_AGENT', '') if request else ''
    
    AuditLog.objects.create(
        user=user,
        action=action,
        resource=resource,
        resourceId=str(resource_id) if resource_id else '',
        ipAddress=ip_address,
        userAgent=user_agent
    )

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    serializer = UserCreateSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        log_audit(user, 'create', 'user', user.id, request)
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        log_audit(user, 'login', 'user', user.id, request)
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    
    return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def logout(request):
    if request.user.is_authenticated:
        log_audit(request.user, 'logout', 'user', request.user.id, request)
    return Response({'message': 'Logged out successfully'})

@api_view(['GET'])
def current_user(request):
    if request.user.is_authenticated:
        return Response(UserSerializer(request.user).data)
    return Response({'detail': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

# Health Assessment Views
class HealthAssessmentListCreateView(generics.ListCreateAPIView):
    serializer_class = HealthAssessmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return HealthAssessment.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        assessment = serializer.save(user=self.request.user)
        log_audit(self.request.user, 'create', 'health_assessment', assessment.id, self.request)

class HealthAssessmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = HealthAssessmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return HealthAssessment.objects.filter(user=self.request.user)

# Appointment Views
class AppointmentListCreateView(generics.ListCreateAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Appointment.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        appointment = serializer.save(user=self.request.user)
        log_audit(self.request.user, 'create', 'appointment', appointment.id, self.request)

class AppointmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Appointment.objects.filter(user=self.request.user)

# Consent Views
class ConsentListCreateView(generics.ListCreateAPIView):
    serializer_class = ConsentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Consent.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        consent = serializer.save(user=self.request.user)
        action = 'consent_granted' if consent.granted else 'consent_revoked'
        log_audit(self.request.user, action, 'consent', consent.id, self.request)

class ConsentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ConsentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Consent.objects.filter(user=self.request.user)
    
    def perform_update(self, serializer):
        consent = serializer.save()
        action = 'consent_granted' if consent.granted else 'consent_revoked'
        log_audit(self.request.user, action, 'consent', consent.id, self.request)

# Health Goal Views
class HealthGoalListCreateView(generics.ListCreateAPIView):
    serializer_class = HealthGoalSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return HealthGoal.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        goal = serializer.save(user=self.request.user)
        log_audit(self.request.user, 'create', 'health_goal', goal.id, self.request)

class HealthGoalDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = HealthGoalSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return HealthGoal.objects.filter(user=self.request.user)

# Health Activity Views
class HealthActivityListCreateView(generics.ListCreateAPIView):
    serializer_class = HealthActivitySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return HealthActivity.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        activity = serializer.save(user=self.request.user)
        log_audit(self.request.user, 'create', 'health_activity', activity.id, self.request)

# Corporate Views (for HR/Corporate users)
@api_view(['GET'])
def corporate_metrics(request):
    if request.user.role not in ['hr', 'corporate', 'admin']:
        return Response({'detail': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    # Calculate real metrics from database
    total_users = User.objects.filter(role='patient').count()
    assessments_completed = HealthAssessment.objects.count()
    active_goals = HealthGoal.objects.filter(status='active').count()
    
    # Calculate completion rate
    completion_rate = (assessments_completed / total_users * 100) if total_users > 0 else 0
    
    # Calculate average wellness score (using stress level as proxy)
    avg_wellness = HealthAssessment.objects.aggregate(
        avg_score=Avg('stressLevel')
    )['avg_score'] or 0
    
    metrics = {
        'totalEmployees': total_users,
        'healthAssessmentCompletion': round(completion_rate, 1),
        'averageWellnessScore': round(10 - avg_wellness, 1) if avg_wellness else 7.0,  # Invert stress level
        'activeHealthGoals': active_goals
    }
    
    log_audit(request.user, 'read', 'corporate_metrics', None, request)
    return Response(metrics)

@api_view(['GET'])
def department_metrics(request):
    if request.user.role not in ['hr', 'corporate', 'admin']:
        return Response({'detail': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    # Mock department data - in real implementation, would be calculated from actual data
    departments = [
        {'name': 'Engineering', 'employees': 45, 'completionRate': 82.2},
        {'name': 'Sales', 'employees': 32, 'completionRate': 75.0},
        {'name': 'Marketing', 'employees': 28, 'completionRate': 89.3},
        {'name': 'HR', 'employees': 12, 'completionRate': 100.0},
        {'name': 'Finance', 'employees': 18, 'completionRate': 72.2}
    ]
    
    log_audit(request.user, 'read', 'department_metrics', None, request)
    return Response(departments)

@api_view(['GET'])
def recent_activities(request):
    if request.user.role not in ['hr', 'corporate', 'admin']:
        return Response({'detail': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    activities = AuditLog.objects.filter(
        timestamp__gte=timezone.now() - timedelta(days=7)
    ).order_by('-timestamp')[:10]
    
    return Response(AuditLogSerializer(activities, many=True).data)

# Report Views
class ReportListCreateView(generics.ListCreateAPIView):
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role in ['hr', 'corporate', 'admin']:
            return Report.objects.all()
        return Report.objects.filter(generatedBy=self.request.user)
    
    def perform_create(self, serializer):
        report = serializer.save(generatedBy=self.request.user)
        log_audit(self.request.user, 'create', 'report', report.id, self.request)

# Audit Log Views (Admin only)
class AuditLogListView(generics.ListAPIView):
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role != 'admin':
            return AuditLog.objects.none()
        return AuditLog.objects.all()

@api_view(['GET'])
def user_audit_log(request):
    """Get audit log for current user"""
    logs = AuditLog.objects.filter(user=request.user).order_by('-timestamp')[:20]
    return Response(AuditLogSerializer(logs, many=True).data)