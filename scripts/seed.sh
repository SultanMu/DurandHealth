#!/bin/bash

# Seed script to populate the database with initial data
set -e

echo "Seeding database with initial data..."

# Wait for backend to be ready
echo "Waiting for backend service..."
until curl -f http://localhost:8000/admin/ > /dev/null 2>&1; do
  sleep 2
done

echo "Backend is ready. Seeding data..."

# Seed data through Django management command
docker-compose exec backend python manage.py shell << 'EOF'
from healthcare.models import User, HealthAssessment, Appointment, Consent, HealthGoal, HealthActivity, IncentiveProgram
from django.utils import timezone
from datetime import datetime, timedelta
import json

# Create sample health assessments
print("Creating sample health assessments...")
patient = User.objects.filter(username='patient1').first()
if patient and not HealthAssessment.objects.filter(user=patient).exists():
    HealthAssessment.objects.create(
        user=patient,
        height=175.0,
        weight=70.0,
        bloodPressureSystolic=120,
        bloodPressureDiastolic=80,
        heartRate=72,
        smokingStatus='never',
        exerciseFrequency='3-4 times per week',
        dietQuality='balanced',
        stressLevel=5,
        sleepHours=7.5,
        chronicConditions=[],
        medications=[],
        allergies=[]
    )

# Create sample appointments
print("Creating sample appointments...")
if patient and not Appointment.objects.filter(user=patient).exists():
    Appointment.objects.create(
        user=patient,
        appointmentType='general_checkup',
        provider='Dr. Sarah Johnson',
        date=timezone.now() + timedelta(days=7),
        location='Main Health Center',
        notes='Annual physical examination',
        status='scheduled'
    )

# Create sample health goals
print("Creating sample health goals...")
if patient and not HealthGoal.objects.filter(user=patient).exists():
    HealthGoal.objects.create(
        user=patient,
        goalType='weight_loss',
        description='Lose 5 kg by summer',
        targetValue=5.0,
        currentValue=1.5,
        unit='kg',
        targetDate=timezone.now().date() + timedelta(days=90),
        status='active'
    )
    
    HealthGoal.objects.create(
        user=patient,
        goalType='exercise',
        description='Walk 10,000 steps daily',
        targetValue=10000.0,
        currentValue=7500.0,
        unit='steps',
        targetDate=timezone.now().date() + timedelta(days=30),
        status='active'
    )

# Create sample health activities
print("Creating sample health activities...")
if patient and not HealthActivity.objects.filter(user=patient).exists():
    activities = [
        {'type': 'exercise', 'desc': '30-minute morning run', 'hours': 1},
        {'type': 'meal', 'desc': 'Mediterranean lunch with salmon', 'hours': 3},
        {'type': 'medication', 'desc': 'Took morning vitamins', 'hours': 8},
        {'type': 'vital_signs', 'desc': 'Blood pressure: 118/78 mmHg', 'hours': 24},
        {'type': 'exercise', 'desc': 'Yoga session - 45 minutes', 'hours': 48}
    ]
    
    for activity in activities:
        HealthActivity.objects.create(
            user=patient,
            activityType=activity['type'],
            description=activity['desc'],
            recordedAt=timezone.now() - timedelta(hours=activity['hours']),
            metadata={'duration': 30 if activity['type'] == 'exercise' else None}
        )

# Create sample incentive programs
print("Creating sample incentive programs...")
if not IncentiveProgram.objects.exists():
    IncentiveProgram.objects.create(
        name='Step Challenge 2024',
        description='Corporate-wide step counting challenge',
        requirements={'daily_steps': 8000, 'duration_days': 30},
        rewards={'points': 100, 'badge': 'Step Master'},
        isActive=True,
        startDate=timezone.now().date(),
        endDate=timezone.now().date() + timedelta(days=60)
    )

print("Database seeded successfully!")
EOF

echo "Data seeding completed!"