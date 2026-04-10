import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your_super_secret_refresh_token_key';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '30d';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

interface RefreshTokenPayload {
  userId: string;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

interface RegisterInput {
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'technician' | 'client';
}

interface AuthResponse {
  user: {
    id: mongoose.Types.ObjectId;
    email: string;
    name: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Compare password
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Generate tokens
export const generateTokens = (userId: mongoose.Types.ObjectId, email: string, role: string): TokenResponse => {
  const userIdString = userId.toString();
  const accessToken = jwt.sign(
    { userId: userIdString, email, role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY } as SignOptions
  );

  const refreshToken = jwt.sign(
    { userId: userIdString },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY } as SignOptions
  );

  return { accessToken, refreshToken };
};

// Register user
export const register = async (input: RegisterInput): Promise<AuthResponse> => {
  const { email, password, name, role = 'client' } = input;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const user = await User.create({
    email,
    name,
    passwordHash,
    role,
  });

  const { accessToken, refreshToken } = generateTokens(user._id, user.email, user.role);

  return {
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

// Login user
export const login = async (input: { email: string; password: string }): Promise<AuthResponse> => {
  const { email, password } = input;

  // Find user
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Check password
  const isValidPassword = await comparePassword(password, user.passwordHash);
  if (!isValidPassword) {
    throw new Error('Invalid email or password');
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  const { accessToken, refreshToken } = generateTokens(user._id, user.email, user.role);

  return {
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

// Refresh token
export const refreshAccessToken = async (refreshToken: string): Promise<TokenResponse> => {
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
    const user = await User.findById(decoded.userId);

    if (!user || user.status !== 'active') {
      throw new Error('User not found');
    }

    const tokens = generateTokens(user._id, user.email, user.role);
    return tokens;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};
