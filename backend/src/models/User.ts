import mongoose, { Schema, Document } from 'mongoose';

interface IUserDocument extends UserRequest, Document {}

interface UserRequest {
  email: string;
  passwordHash: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    passwordHash: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUserDocument>('User', userSchema);
