export interface User {
    _id?: string;
    email: string;
    passwordHash: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface UserRegistration {
    email: string;
    password: string;
    confirmPassword: string;
}
export interface UserLogin {
    email: string;
    password: string;
}
export interface AuthToken {
    token: string;
    userId: string;
    email: string;
}
export interface KeystrokeEvent {
    timestamp: number;
    keyCode?: number;
    keyType?: 'keydown' | 'keyup';
    timeSinceLastKey?: number;
}
export interface PasteEvent {
    timestamp: number;
    pastedTextLength: number;
    position: number;
}
export interface WritingSession {
    _id?: string;
    userId: string;
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
export interface SessionReport {
    sessionId: string;
    userId: string;
    contentLength: number;
    keystrokeCount: number;
    pasteCount: number;
    averageTypingSpeed: number;
    averagePause: number;
    suspiciousPasteRatio: number;
    suspiciousPatterns: string[];
    confidenceScore: number;
    timestamp: Date;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
//# sourceMappingURL=index.d.ts.map