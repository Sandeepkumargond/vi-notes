import { KeystrokeEvent, PasteEvent } from '../types';
export interface AnalysisResult {
    averageTypingSpeed: number;
    averagePause: number;
    suspiciousPasteRatio: number;
    suspiciousPatterns: string[];
    confidenceScore: number;
}
export declare const analyzeSession: (keystrokes: KeystrokeEvent[], pasteEvents: PasteEvent[], contentLength: number, keystrokeCount: number) => AnalysisResult;
//# sourceMappingURL=analysis.d.ts.map