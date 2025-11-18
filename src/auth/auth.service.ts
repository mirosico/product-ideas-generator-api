import { supabase } from '../shared/utils/database.js';
import { logger } from '../shared/utils/logger.js';
import { RegisterDto, LoginDto, AuthResponse } from './auth.model.js';
import { AppError } from '../shared/middleware/error.middleware.js';

export class AuthService {
  async register(dto: RegisterDto): Promise<AuthResponse> {
    const { email, password, name } = dto;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      logger.error('Registration failed', { error: error.message, email });
      throw new AppError(400, error.message);
    }

    if (!data.user) {
      throw new AppError(400, 'Registration failed: user not created');
    }

    if (!data.session) {
      logger.info('User registered, email confirmation required', { userId: data.user.id, email });

      return {
        user: {
          id: data.user.id,
          email: data.user.email!,
        },
        session: null,
        message: 'Registration successful. Please check your email to confirm your account.',
      };
    }

    logger.info('User registered successfully', { userId: data.user.id, email });

    return {
      user: {
        id: data.user.id,
        email: data.user.email!,
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at!,
      },
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const { email, password } = dto;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logger.warn('Login failed', { error: error.message, email });
      throw new AppError(401, 'Invalid email or password');
    }

    if (!data.user || !data.session) {
      throw new AppError(401, 'Login failed');
    }

    logger.info('User logged in successfully', { userId: data.user.id, email });

    return {
      user: {
        id: data.user.id,
        email: data.user.email!,
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at!,
      },
    };
  }

  async logout(accessToken: string): Promise<void> {
    const { error } = await supabase.auth.admin.signOut(accessToken);

    if (error) {
      logger.error('Logout failed', { error: error.message });
      throw new AppError(400, 'Logout failed');
    }

    logger.info('User logged out successfully');
  }

  async getCurrentUser(accessToken: string) {
    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data.user) {
      throw new AppError(401, 'Invalid or expired token');
    }

    return {
      id: data.user.id,
      email: data.user.email!,
      created_at: data.user.created_at,
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session || !data.user) {
      logger.warn('Token refresh failed', { error: error?.message });
      throw new AppError(401, 'Invalid refresh token');
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email!,
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at!,
      },
    };
  }
}

export const authService = new AuthService();
