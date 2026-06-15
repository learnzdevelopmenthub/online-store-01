import { Schema, model, type HydratedDocument } from 'mongoose';

export type UserRole = 'buyer' | 'admin';

export interface IUser {
  fullName: string;
  email: string;
  // Optional fields carry schema defaults; null for Google-only accounts (Google auth → #64).
  passwordHash?: string | null;
  googleId?: string | null;
  avatar?: string | null;
  role?: UserRole;
  isActive?: boolean;
  // Argon2id hash of the active refresh token; null when logged out.
  refreshToken?: string | null;
}

const userSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: null },
    googleId: { type: String, default: null, unique: true, sparse: true },
    avatar: { type: String, default: null },
    role: { type: String, enum: ['buyer', 'admin'], default: 'buyer' },
    isActive: { type: Boolean, default: true },
    refreshToken: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform: (_doc, ret) => {
        const record = ret as Record<string, unknown>;
        delete record.passwordHash;
        delete record.refreshToken;
        return record;
      },
    },
  },
);

export type UserDoc = HydratedDocument<IUser>;

export const User = model<IUser>('User', userSchema);
