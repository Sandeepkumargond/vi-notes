import mongoose, { Document, Types } from 'mongoose';
interface ISessionReportDocument extends SessionReportRequest, Document {
}
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
export declare const SessionReportModel: mongoose.Model<ISessionReportDocument, {}, {}, {}, mongoose.Document<unknown, {}, ISessionReportDocument> & ISessionReportDocument & {
    _id: Types.ObjectId;
}, any>;
export {};
//# sourceMappingURL=SessionReport.d.ts.map