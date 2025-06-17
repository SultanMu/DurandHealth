from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import (
    User, HealthAssessment, Appointment, Consent, 
    HealthGoal, HealthActivity, IncentiveProgram, 
    UserIncentive, Report, AuditLog
)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'firstName', 'lastName', 'role', 'createdAt', 'updatedAt']
        read_only_fields = ['id', 'createdAt', 'updatedAt']

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'firstName', 'lastName', 'role', 'password']
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    
    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            data['user'] = user
        else:
            raise serializers.ValidationError('Must include username and password')
        
        return data

class HealthAssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthAssessment
        fields = '__all__'
        read_only_fields = ['id', 'user', 'createdAt']

class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ['id', 'user', 'createdAt', 'updatedAt']

class ConsentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consent
        fields = '__all__'
        read_only_fields = ['id', 'user', 'createdAt', 'updatedAt']

class HealthGoalSerializer(serializers.ModelSerializer):
    progress_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = HealthGoal
        fields = '__all__'
        read_only_fields = ['id', 'user', 'createdAt', 'updatedAt']

class HealthActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthActivity
        fields = '__all__'
        read_only_fields = ['id', 'user', 'createdAt']

class IncentiveProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = IncentiveProgram
        fields = '__all__'
        read_only_fields = ['id', 'createdAt']

class UserIncentiveSerializer(serializers.ModelSerializer):
    program = IncentiveProgramSerializer(read_only=True)
    
    class Meta:
        model = UserIncentive
        fields = '__all__'
        read_only_fields = ['id', 'user', 'createdAt']

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = '__all__'
        read_only_fields = ['id', 'generatedBy', 'createdAt']

class AuditLogSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = AuditLog
        fields = '__all__'
        read_only_fields = ['id', 'timestamp']