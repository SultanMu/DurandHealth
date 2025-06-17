from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import json

class User(AbstractUser):
    ROLE_CHOICES = [
        ('patient', 'Patient'),
        ('hr', 'HR'),
        ('corporate', 'Corporate'),
        ('admin', 'Admin'),
    ]
    
    firstName = models.CharField(max_length=100)
    lastName = models.CharField(max_length=100)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='patient')
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.firstName} {self.lastName} ({self.username})"

class HealthAssessment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='health_assessments')
    height = models.FloatField(help_text="Height in cm")
    weight = models.FloatField(help_text="Weight in kg")
    bloodPressureSystolic = models.IntegerField()
    bloodPressureDiastolic = models.IntegerField()
    heartRate = models.IntegerField()
    smokingStatus = models.CharField(max_length=50)
    exerciseFrequency = models.CharField(max_length=100)
    dietQuality = models.CharField(max_length=100)
    stressLevel = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])
    sleepHours = models.FloatField()
    chronicConditions = models.JSONField(default=list, blank=True)
    medications = models.JSONField(default=list, blank=True)
    allergies = models.JSONField(default=list, blank=True)
    emergencyContact = models.JSONField(default=dict, blank=True)
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Health Assessment for {self.user.username} - {self.createdAt.date()}"

class Appointment(models.Model):
    APPOINTMENT_TYPES = [
        ('general_checkup', 'General Checkup'),
        ('specialist_consultation', 'Specialist Consultation'),
        ('follow_up', 'Follow-up'),
        ('emergency', 'Emergency'),
        ('screening', 'Screening'),
        ('vaccination', 'Vaccination'),
    ]
    
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('rescheduled', 'Rescheduled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appointments')
    appointmentType = models.CharField(max_length=50, choices=APPOINTMENT_TYPES)
    provider = models.CharField(max_length=200)
    date = models.DateTimeField()
    location = models.CharField(max_length=200)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.appointmentType} for {self.user.username} on {self.date.date()}"

class Consent(models.Model):
    CONSENT_TYPES = [
        ('data_sharing', 'Data Sharing'),
        ('medical_research', 'Medical Research'),
        ('marketing_communications', 'Marketing Communications'),
        ('third_party_access', 'Third Party Access'),
        ('telemedicine', 'Telemedicine'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='consents')
    consentType = models.CharField(max_length=50, choices=CONSENT_TYPES)
    granted = models.BooleanField(default=False)
    grantedAt = models.DateTimeField(null=True, blank=True)
    revokedAt = models.DateTimeField(null=True, blank=True)
    description = models.TextField()
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    def __str__(self):
        status = "Granted" if self.granted else "Revoked"
        return f"{self.consentType} - {status} for {self.user.username}"

class HealthGoal(models.Model):
    GOAL_TYPES = [
        ('weight_loss', 'Weight Loss'),
        ('exercise', 'Exercise'),
        ('nutrition', 'Nutrition'),
        ('stress_management', 'Stress Management'),
        ('sleep_improvement', 'Sleep Improvement'),
        ('quit_smoking', 'Quit Smoking'),
        ('blood_pressure', 'Blood Pressure Management'),
        ('cholesterol', 'Cholesterol Management'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('paused', 'Paused'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='health_goals')
    goalType = models.CharField(max_length=50, choices=GOAL_TYPES)
    description = models.TextField()
    targetValue = models.FloatField()
    currentValue = models.FloatField(default=0)
    unit = models.CharField(max_length=20)
    targetDate = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.goalType} goal for {self.user.username}"

    @property
    def progress_percentage(self):
        if self.targetValue == 0:
            return 0
        return min((self.currentValue / self.targetValue) * 100, 100)

class HealthActivity(models.Model):
    ACTIVITY_TYPES = [
        ('exercise', 'Exercise'),
        ('meal', 'Meal'),
        ('medication', 'Medication'),
        ('vital_signs', 'Vital Signs'),
        ('symptom', 'Symptom'),
        ('mood', 'Mood'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='health_activities')
    activityType = models.CharField(max_length=50, choices=ACTIVITY_TYPES)
    description = models.TextField()
    value = models.FloatField(null=True, blank=True)
    unit = models.CharField(max_length=20, blank=True)
    duration = models.IntegerField(null=True, blank=True, help_text="Duration in minutes")
    metadata = models.JSONField(default=dict, blank=True)
    recordedAt = models.DateTimeField()
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.activityType} - {self.user.username} on {self.recordedAt.date()}"

class IncentiveProgram(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    requirements = models.JSONField(default=dict)
    rewards = models.JSONField(default=dict)
    isActive = models.BooleanField(default=True)
    startDate = models.DateField()
    endDate = models.DateField()
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class UserIncentive(models.Model):
    STATUS_CHOICES = [
        ('enrolled', 'Enrolled'),
        ('completed', 'Completed'),
        ('withdrawn', 'Withdrawn'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='incentives')
    program = models.ForeignKey(IncentiveProgram, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='enrolled')
    progress = models.JSONField(default=dict)
    completedAt = models.DateTimeField(null=True, blank=True)
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.program.name}"

class Report(models.Model):
    REPORT_TYPES = [
        ('health_summary', 'Health Summary'),
        ('wellness_assessment', 'Wellness Assessment'),
        ('corporate_analytics', 'Corporate Analytics'),
        ('compliance_report', 'Compliance Report'),
    ]

    name = models.CharField(max_length=200)
    reportType = models.CharField(max_length=50, choices=REPORT_TYPES)
    generatedBy = models.ForeignKey(User, on_delete=models.CASCADE, related_name='generated_reports')
    data = models.JSONField(default=dict)
    parameters = models.JSONField(default=dict)
    fileUrl = models.URLField(blank=True)
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.reportType}"

class AuditLog(models.Model):
    ACTION_TYPES = [
        ('create', 'Create'),
        ('read', 'Read'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('consent_granted', 'Consent Granted'),
        ('consent_revoked', 'Consent Revoked'),
        ('data_export', 'Data Export'),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=50, choices=ACTION_TYPES)
    resource = models.CharField(max_length=100)
    resourceId = models.CharField(max_length=100, blank=True)
    ipAddress = models.GenericIPAddressField()
    userAgent = models.TextField(blank=True)
    metadata = models.JSONField(default=dict)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        user_str = self.user.username if self.user else "Anonymous"
        return f"{user_str} - {self.action} {self.resource} at {self.timestamp}"

    class Meta:
        ordering = ['-timestamp']