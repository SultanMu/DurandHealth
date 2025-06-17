// Mock authentication system for testing
export interface MockUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'patient' | 'hr' | 'corporate' | 'admin';
}

const mockUsers: Record<string, { password: string; user: MockUser }> = {
  'patient1': {
    password: 'patient123',
    user: {
      id: 1,
      username: 'patient1',
      email: 'patient1@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'patient'
    }
  },
  'hr1': {
    password: 'hr123456',
    user: {
      id: 2,
      username: 'hr1',
      email: 'hr1@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'hr'
    }
  },
  'corporate1': {
    password: 'corp123456',
    user: {
      id: 3,
      username: 'corporate1',
      email: 'corp1@example.com',
      firstName: 'Mike',
      lastName: 'Johnson',
      role: 'corporate'
    }
  },
  'admin1': {
    password: 'admin123456',
    user: {
      id: 4,
      username: 'admin1',
      email: 'admin1@example.com',
      firstName: 'Sarah',
      lastName: 'Wilson',
      role: 'admin'
    }
  }
};

export function mockLogin(username: string, password: string): Promise<MockUser | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userRecord = mockUsers[username];
      if (userRecord && userRecord.password === password) {
        // Store token in localStorage
        const token = `mock_token_${username}_${Date.now()}`;
        localStorage.setItem('authToken', token);
        localStorage.setItem('currentUser', JSON.stringify(userRecord.user));
        resolve(userRecord.user);
      } else {
        resolve(null);
      }
    }, 500); // Simulate network delay
  });
}

export function mockLogout(): void {
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
}

export function getCurrentUser(): MockUser | null {
  const token = localStorage.getItem('authToken');
  const userData = localStorage.getItem('currentUser');
  
  if (token && userData) {
    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  }
  return null;
}