from django.core.management.base import BaseCommand
from healthcare.models import User

class Command(BaseCommand):
    help = 'Create default users for testing the healthcare system'

    def handle(self, *args, **options):
        default_users = [
            {
                'username': 'patient1',
                'password': 'password123',
                'email': 'patient1@example.com',
                'firstName': 'John',
                'lastName': 'Doe',
                'role': 'patient'
            },
            {
                'username': 'hr1',
                'password': 'password123',
                'email': 'hr1@company.com',
                'firstName': 'Jane',
                'lastName': 'Smith',
                'role': 'hr'
            },
            {
                'username': 'corporate1',
                'password': 'password123',
                'email': 'corporate1@company.com',
                'firstName': 'Bob',
                'lastName': 'Johnson',
                'role': 'corporate'
            },
            {
                'username': 'admin1',
                'password': 'password123',
                'email': 'admin1@system.com',
                'firstName': 'Alice',
                'lastName': 'Admin',
                'role': 'admin'
            }
        ]

        for user_data in default_users:
            username = user_data['username']
            if not User.objects.filter(username=username).exists():
                user = User.objects.create_user(
                    username=username,
                    email=user_data['email'],
                    password=user_data['password'],
                    firstName=user_data['firstName'],
                    lastName=user_data['lastName'],
                    role=user_data['role']
                )
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully created user: {username}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'User {username} already exists')
                )

        self.stdout.write(
            self.style.SUCCESS('Default users setup completed!')
        )