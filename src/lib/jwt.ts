import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";
import { StringValue } from "ms";

// Fungsi helper untuk mendapatkan secret dengan validation
function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error(
      "JWT_SECRET or NEXTAUTH_SECRET must be defined in environment variables"
    );
  }

  if (secret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters long");
  }

  return secret;
}

export function signToken(
  payload: string | object | Buffer,
  expiresIn: StringValue = "30d"
): string {
  const secret = getJWTSecret();

  const options: SignOptions = {
    expiresIn,
    issuer: "your-app-name", // ganti dengan nama aplikasi Anda
  };

  return jwt.sign(payload, secret, options);
}

export function verifyToken(token: string): JwtPayload | string | null {
  try {
    const secret = getJWTSecret();
    return jwt.verify(token, secret);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error("Token has expired");
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.error("Invalid token");
    } else {
      console.error("Token verification failed:", error);
    }
    return null;
  }
}

export function decodeToken(token: string): JwtPayload | string | null {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error("Token decode failed:", error);
    return null;
  }
}

// Fungsi tambahan untuk refresh token
export function signRefreshToken(payload: string | object | Buffer): string {
  const secret = getJWTSecret();

  const options: SignOptions = {
    expiresIn: "7d", // refresh token lebih lama
    issuer: "your-app-name",
  };

  return jwt.sign(payload, secret, options);
}

// Type untuk JWT payload yang lebih spesifik
export interface CustomJWTPayload extends JwtPayload {
  userId?: string;
  email?: string;
  role?: string;
}

export function verifyTokenTyped(token: string): CustomJWTPayload | null {
  const decoded = verifyToken(token);
  return decoded as CustomJWTPayload | null;
}
