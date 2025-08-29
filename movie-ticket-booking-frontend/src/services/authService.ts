import type { User, CreateUserRequest } from '../types';

const API_BASE_URL = 'http://localhost:8080';

// Mock authentication service (will be replaced with real API calls)
export class AuthService {
  private static instance: AuthService;
  private users: User[] = [];
  private currentId = 7; // Starting from 7 since existing data goes up to 6

  private constructor() {
    // Initialize with existing users from db.json
    this.users = [
      {
        id: 0,
        firstName: 'Super',
        lastName: 'Admin',
        email: 'superadmin@moviehub.com',
        phone: '+1-555-0100',
        role: 'SUPER_ADMIN',
        active: true,
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 1,
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@moviehub.com',
        phone: '+1-555-0123',
        role: 'ADMIN',
        active: true,
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 2,
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        phone: '+1-555-0124',
        role: 'THEATER_OWNER',
        active: true,
        createdAt: '2024-01-05T10:30:00Z',
      },
      {
        id: 3,
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        phone: '+1-555-0125',
        role: 'THEATER_OWNER',
        active: true,
        createdAt: '2024-01-06T14:20:00Z',
      },
      {
        id: 4,
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@example.com',
        phone: '+1-555-0126',
        role: 'THEATER_OWNER',
        active: true,
        createdAt: '2024-01-07T09:15:00Z',
      },
      {
        id: 5,
        firstName: 'Sarah',
        lastName: 'Wilson',
        email: 'sarah.wilson@example.com',
        phone: '+1-555-0127',
        role: 'CUSTOMER',
        active: true,
        createdAt: '2024-01-10T16:45:00Z',
      },
      {
        id: 6,
        firstName: 'SAJID',
        lastName: 'SHAIKH',
        email: 'ss2728303@gmail.com',
        phone: '+1-555-0128',
        role: 'CUSTOMER',
        active: true,
        createdAt: '2025-08-28T20:08:16.883Z',
      },
    ];
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    // Make actual API call to backend
    try {
      console.log('Calling backend login API for:', email);
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Backend login response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (!data.user || !data.token) {
        throw new Error(data.message || 'Invalid response from server');
      }

      return { user: data.user, token: data.token };
    } catch (error) {
      console.error('Login API error:', error);
      // If backend is not available, fall back to mock authentication
      console.warn('Backend not available, using mock authentication:', error);
      return this.mockLogin(email, password);
    }
  }

  async signup(userData: Omit<CreateUserRequest, 'role'> & { role?: string }): Promise<{ user: User; token: string }> {
    // Make actual API call to backend
    try {
      console.log('Calling backend signup API with:', userData);
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone || '',
          password: userData.password,
          role: userData.role || 'CUSTOMER',
        }),
      });

      const data = await response.json();
      console.log('Backend signup response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      if (!data.user || !data.token) {
        throw new Error(data.message || 'Invalid response from server');
      }

      return { user: data.user, token: data.token };
    } catch (error) {
      console.error('Signup API error:', error);
      // If backend is not available, fall back to mock signup
      console.warn('Backend not available, using mock signup:', error);
      return this.mockSignup(userData);
    }
  }

  async validateToken(token: string): Promise<User | null> {
    try {
      // In a real implementation, you would validate the JWT token
      // For demo purposes, we'll decode the mock token
      const payload = JSON.parse(atob(token.split('.')[1]));
      const user = this.users.find(u => u.id === payload.userId);
      return user || null;
    } catch (error) {
      return null;
    }
  }

  private generateMockToken(user: User): string {
    // Generate a mock JWT-like token (3 parts separated by dots)
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      userId: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    }));
    const signature = btoa('mock-signature');
    return `${header}.${payload}.${signature}`;
  }

  // @ts-ignore - Method kept for future API integration
  private async syncWithAPI(user: User): Promise<void> {
    // Try to sync with the real API
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          password: 'default123', // In real implementation, this would be hashed
        }),
      });

      if (response.ok) {
        console.log('User synced with API successfully');
      }
    } catch (error) {
      console.warn('API sync failed, continuing with local storage');
    }
  }

  // Method to get all users (for admin purposes)
  getUsers(): User[] {
    return this.users;
  }

  // Method to update user
  updateUser(id: number, updates: Partial<User>): User | null {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return null;
    }

    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    return this.users[userIndex];
  }

  // Mock login method for fallback
  private async mockLogin(email: string, password: string): Promise<{ user: User; token: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Find user by email
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.active) {
      throw new Error('Account is disabled');
    }

    // In a real implementation, you would verify the password hash
    // For demo purposes, we'll accept some predefined passwords
    const validPasswords = {
      'superadmin@moviehub.com': 'superadmin123',
      'admin@moviehub.com': 'admin123',
      'sarah.wilson@example.com': 'password123',
      'ss2728303@gmail.com': 'sajidsai',
      'john.smith@example.com': 'theater123',
      'jane.doe@example.com': 'theater123',
      'mike.johnson@example.com': 'theater123',
    };

    const expectedPassword = validPasswords[email.toLowerCase() as keyof typeof validPasswords];
    if (!expectedPassword || password !== expectedPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate a mock JWT token
    const token = this.generateMockToken(user);

    return { user, token };
  }

  // Mock signup method for fallback  
  private async mockSignup(userData: Omit<CreateUserRequest, 'role'> & { role?: string }): Promise<{ user: User; token: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Check if user already exists
    const existingUser = this.users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existingUser) {
      throw new Error('An account with this email already exists');
    }

    // Create new user
    const newUser: User = {
      id: this.currentId++,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone || '',
      role: 'CUSTOMER', // All signups are customers by default
      active: true,
      createdAt: new Date().toISOString(),
    };

    // Add to mock database
    this.users.push(newUser);

    // Generate a mock JWT token
    const token = this.generateMockToken(newUser);

    return { user: newUser, token };
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();

// Export types for convenience
export type LoginResponse = { user: User; token: string };
export type SignupResponse = { user: User; token: string };
