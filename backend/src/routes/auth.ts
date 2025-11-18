import { Hono } from 'hono';
import type { Env, LoginRequest, RegisterRequest, AuthResponse, User } from '../types';
import { generateId, hashPassword, verifyPassword, generateToken, isValidEmail, getCurrentTimestamp } from '../utils/crypto';

export const authRoutes = new Hono<{ Bindings: Env }>();

/**
 * Register a new user
 * POST /auth/register
 */
authRoutes.post('/register', async (c) => {
  try {
    const body = await c.req.json<RegisterRequest>();
    const { email, password, name } = body;

    // Validation
    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    if (!isValidEmail(email)) {
      return c.json({ error: 'Invalid email format' }, 400);
    }

    if (password.length < 8) {
      return c.json({ error: 'Password must be at least 8 characters' }, 400);
    }

    const db = c.env.DB;

    // Check if user already exists
    const existingUser = await db
      .prepare('SELECT id FROM users WHERE email = ?')
      .bind(email)
      .first();

    if (existingUser) {
      return c.json({ error: 'User already exists' }, 409);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const userId = generateId('usr');
    const timestamp = getCurrentTimestamp();

    await db
      .prepare(
        'INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(userId, email, passwordHash, name, 'user', timestamp, timestamp)
      .run();

    // Create session
    const sessionId = generateId('ses');
    const token = generateToken();
    const expiresAt = getCurrentTimestamp() + (30 * 24 * 60 * 60); // 30 days

    await db
      .prepare(
        'INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)'
      )
      .bind(sessionId, userId, token, expiresAt, timestamp)
      .run();

    const user: Omit<User, 'password_hash'> = {
      id: userId,
      email,
      name,
      role: 'user',
      created_at: timestamp,
      updated_at: timestamp,
    };

    return c.json<AuthResponse>({ user, token }, 201);
  } catch (error) {
    console.error('Register error:', error);
    return c.json({ error: 'Registration failed' }, 500);
  }
});

/**
 * Login
 * POST /auth/login
 */
authRoutes.post('/login', async (c) => {
  try {
    const body = await c.req.json<LoginRequest>();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const db = c.env.DB;

    // Get user
    const user = await db
      .prepare('SELECT * FROM users WHERE email = ?')
      .bind(email)
      .first<User>();

    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Create session
    const sessionId = generateId('ses');
    const token = generateToken();
    const expiresAt = getCurrentTimestamp() + (30 * 24 * 60 * 60); // 30 days
    const timestamp = getCurrentTimestamp();

    await db
      .prepare(
        'INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)'
      )
      .bind(sessionId, user.id, token, expiresAt, timestamp)
      .run();

    const userResponse: Omit<User, 'password_hash'> = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    return c.json<AuthResponse>({ user: userResponse, token });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Login failed' }, 500);
  }
});

/**
 * Logout
 * POST /auth/logout
 */
authRoutes.post('/logout', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const token = authHeader.substring(7);
    const db = c.env.DB;

    // Delete session
    await db
      .prepare('DELETE FROM sessions WHERE token = ?')
      .bind(token)
      .run();

    return c.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return c.json({ error: 'Logout failed' }, 500);
  }
});

/**
 * Get current user
 * GET /auth/me
 */
authRoutes.get('/me', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const token = authHeader.substring(7);
    const db = c.env.DB;

    // Get session
    const session = await db
      .prepare('SELECT user_id, expires_at FROM sessions WHERE token = ?')
      .bind(token)
      .first<{ user_id: string; expires_at: number }>();

    if (!session) {
      return c.json({ error: 'Invalid session' }, 401);
    }

    // Check expiration
    if (getCurrentTimestamp() > session.expires_at) {
      await db.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
      return c.json({ error: 'Session expired' }, 401);
    }

    // Get user
    const user = await db
      .prepare('SELECT id, email, name, role, created_at, updated_at FROM users WHERE id = ?')
      .bind(session.user_id)
      .first<Omit<User, 'password_hash'>>();

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    return c.json({ error: 'Failed to get user' }, 500);
  }
});
