import mongoose, { Schema, Document, Types } from 'mongoose';
import { SessionReport } from '../types/definitions';

interface ISessionReportDocument extends SessionReportRequest, Document {}

interface SessionReportRequest {
  sessionId: Types.ObjectId;
  userId: Types.ObjectId;
  contentLength: number;
  keystrokeCount: number;
  pasteCount: number;
  averageTypingSpeed: number;
  averagePause: number;
  suspiciousPasteRatio: number;
  suspiciousPatterns: string[];
  confidenceScore: number;
  timestamp: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const sessionReportSchema = new Schema<ISessionReportDocument>(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'WritingSession',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    contentLength: {
      type: Number,
      required: true,
    },
    keystrokeCount: {
      type: Number,
      required: true,
    },
    pasteCount: {
      type: Number,
      required: true,
    },
    averageTypingSpeed: {
      type: Number,
      required: true,
    },
    averagePause: {
      type: Number,
      required: true,
    },
    suspiciousPasteRatio: {
      type: Number,
      required: true,
    },
    suspiciousPatterns: [String],
    confidenceScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const SessionReportModel = mongoose.model<ISessionReportDocument>(
  'SessionReport',
  sessionReportSchema
);
