import mongoose, { Schema, Document, Types } from 'mongoose';
import { WritingSession, KeystrokeEvent, PasteEvent } from '../types/definitions';

interface IWritingSessionDocument extends WritingSessionRequest, Document {}

interface WritingSessionRequest {
  userId: Types.ObjectId;
  content: string;
  keystrokes: KeystrokeEvent[];
  pasteEvents: PasteEvent[];
  startTime: Date;
  endTime?: Date;
  totalDuration?: number;
  wordCount: number;
  characterCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const keystrokeSchema = new Schema<KeystrokeEvent>(
  {
    timestamp: {
      type: Number,
      required: true,
    },
    keyType: {
      type: String,
      enum: ['keydown', 'keyup'],
    },
    timeSinceLastKey: {
      type: Number,
    },
  },
  { _id: false }
);

const pasteEventSchema = new Schema<PasteEvent>(
  {
    timestamp: {
      type: Number,
      required: true,
    },
    pastedTextLength: {
      type: Number,
      required: true,
    },
    position: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const writingSessionSchema = new Schema<IWritingSessionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    keystrokes: [keystrokeSchema],
    pasteEvents: [pasteEventSchema],
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
    },
    totalDuration: {
      type: Number,
    },
    wordCount: {
      type: Number,
      required: true,
    },
    characterCount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export const WritingSessionModel = mongoose.model<IWritingSessionDocument>(
  'WritingSession',
  writingSessionSchema
);
