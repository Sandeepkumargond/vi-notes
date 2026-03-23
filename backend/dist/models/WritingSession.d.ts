import mongoose, { Document, Types } from 'mongoose';
import { KeystrokeEvent, PasteEvent } from '../types/definitions';
interface IWritingSessionDocument extends WritingSessionRequest, Document {
}
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
export declare const WritingSessionModel: mongoose.Model<IWritingSessionDocument, {}, {}, {}, mongoose.Document<unknown, {}, IWritingSessionDocument> & IWritingSessionDocument & {
    _id: Types.ObjectId;
}, any>;
export {};
//# sourceMappingURL=WritingSession.d.ts.map