"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeSession = void 0;
const analyzeSession = (keystrokes, pasteEvents, contentLength, keystrokeCount) => {
    const suspiciousPatterns = [];
    let confidenceScore = 85; // Start with baseline
    // Calculate typing speed (characters per second)
    const timeDifferences = keystrokes
        .map(k => k.timeSinceLastKey || 0)
        .filter(t => t > 0 && t < 5000); // Filter outliers
    const averageTypingSpeed = timeDifferences.length > 0
        ? timeDifferences.reduce((a, b) => a + b, 0) / timeDifferences.length
        : 0;
    // Calculate average pause duration
    const pauses = timeDifferences.filter(t => t > 500);
    const averagePause = pauses.length > 0
        ? pauses.reduce((a, b) => a + b, 0) / pauses.length
        : 0;
    // Analyze paste events
    const totalPastedChars = pasteEvents.reduce((sum, e) => sum + e.pastedTextLength, 0);
    const suspiciousPasteRatio = contentLength > 0 ? totalPastedChars / contentLength : 0;
    // Pattern detection
    if (suspiciousPasteRatio > 0.3) {
        suspiciousPatterns.push('High paste-to-typing ratio detected');
        confidenceScore -= 15;
    }
    if (averageTypingSpeed < 50 || averageTypingSpeed > 200) {
        suspiciousPatterns.push('Unusual typing speed detected');
        confidenceScore -= 10;
    }
    if (pasteEvents.length > keystrokeCount / 3) {
        suspiciousPatterns.push('Excessive pasting detected');
        confidenceScore -= 20;
    }
    if (keystrokeCount === 0 && contentLength > 0) {
        suspiciousPatterns.push('Content without keystroke data');
        confidenceScore -= 30;
    }
    // Consistency check - very uniform typing speed suggests AI or paste
    if (timeDifferences.length > 10) {
        const mean = timeDifferences.reduce((a, b) => a + b, 0) / timeDifferences.length;
        const variance = timeDifferences.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
            timeDifferences.length;
        const stdDev = Math.sqrt(variance);
        // Low variance suggests uniformity
        if (stdDev < mean * 0.1) {
            suspiciousPatterns.push('Suspicious typing consistency');
            confidenceScore -= 15;
        }
    }
    // Ensure confidence score stays in valid range
    confidenceScore = Math.max(0, Math.min(100, confidenceScore));
    return {
        averageTypingSpeed,
        averagePause,
        suspiciousPasteRatio,
        suspiciousPatterns,
        confidenceScore,
    };
};
exports.analyzeSession = analyzeSession;
//# sourceMappingURL=analysis.js.map