export interface User {
  id: string;
  email: string;
  name: string;
  hashedPassword: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error?: string;
} 