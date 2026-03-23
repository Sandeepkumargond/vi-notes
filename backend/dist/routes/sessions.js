"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const models_1 = require("../models");
const utils_1 = require("../utils");
const router = (0, express_1.Router)();
// Save Writing Session (Feature #5)
router.post('/sessions', auth_1.authMiddleware, async (req, res) => {
    try {
        const { content, keystrokes, pasteEvents, startTime, endTime } = req.body;
        // Validation
        if (!content) {
            return res.status(400).json({
                success: false,
                error: 'Content is required',
            });
        }
        const wCount = (0, utils_1.wordCount)(content);
        const cCount = (0, utils_1.characterCount)(content);
        const endTimeDate = endTime ? new Date(endTime) : new Date();
        const startTimeDate = new Date(startTime || Date.now());
        const totalDuration = Math.floor((endTimeDate.getTime() - startTimeDate.getTime()) / 1000);
        const session = await models_1.WritingSessionModel.create({
            userId: req.userId,
            content,
            keystrokes: keystrokes || [],
            pasteEvents: pasteEvents || [],
            startTime: startTimeDate,
            endTime: endTimeDate,
            totalDuration,
            wordCount: wCount,
            characterCount: cCount,
        });
        // Generate analysis report
        const keystrokeCount = (keystrokes || []).length;
        const pasteCount = (pasteEvents || []).length;
        const analysis = (0, utils_1.analyzeSession)(keystrokes || [], pasteEvents || [], cCount, keystrokeCount);
        // Create session report
        const report = await models_1.SessionReportModel.create({
            sessionId: session._id,
            userId: req.userId,
            contentLength: cCount,
            keystrokeCount,
            pasteCount,
            averageTypingSpeed: analysis.averageTypingSpeed,
            averagePause: analysis.averagePause,
            suspiciousPasteRatio: analysis.suspiciousPasteRatio,
            suspiciousPatterns: analysis.suspiciousPatterns,
            confidenceScore: analysis.confidenceScore,
            timestamp: new Date(),
        });
        return res.status(201).json({
            success: true,
            data: {
                session: {
                    _id: session._id,
                    userId: session.userId,
                    wordCount: session.wordCount,
                    characterCount: session.characterCount,
                    keystrokeCount,
                    pasteCount,
                    totalDuration,
                    createdAt: session.createdAt,
                },
                report: {
                    _id: report._id,
                    confidenceScore: report.confidenceScore,
                    suspiciousPatterns: report.suspiciousPatterns,
                    averageTypingSpeed: report.averageTypingSpeed,
                    suspiciousPasteRatio: report.suspiciousPasteRatio,
                },
            },
            message: 'Session saved successfully',
        });
    }
    catch (error) {
        console.error('Save session error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to save session',
        });
    }
});
// Get Writing Session
router.get('/sessions/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const session = await models_1.WritingSessionModel.findById(req.params.id);
        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found',
            });
        }
        if (session.userId.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                error: 'Unauthorized',
            });
        }
        return res.status(200).json({
            success: true,
            data: session,
        });
    }
    catch (error) {
        console.error('Get session error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch session',
        });
    }
});
// Get User's Sessions
router.get('/sessions', auth_1.authMiddleware, async (req, res) => {
    try {
        const sessions = await models_1.WritingSessionModel.find({ userId: req.userId })
            .select('-content')
            .sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            data: sessions,
        });
    }
    catch (error) {
        console.error('Get sessions error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch sessions',
        });
    }
});
// Get Session Report
router.get('/reports/:sessionId', auth_1.authMiddleware, async (req, res) => {
    try {
        const report = await models_1.SessionReportModel.findOne({
            sessionId: req.params.sessionId,
            userId: req.userId,
        });
        if (!report) {
            return res.status(404).json({
                success: false,
                error: 'Report not found',
            });
        }
        return res.status(200).json({
            success: true,
            data: report,
        });
    }
    catch (error) {
        console.error('Get report error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch report',
        });
    }
});
// Delete Session
router.delete('/sessions/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const session = await models_1.WritingSessionModel.findById(req.params.id);
        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found',
            });
        }
        if (session.userId.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                error: 'Unauthorized',
            });
        }
        await models_1.WritingSessionModel.deleteOne({ _id: req.params.id });
        await models_1.SessionReportModel.deleteOne({ sessionId: req.params.id });
        return res.status(200).json({
            success: true,
            message: 'Session deleted successfully',
        });
    }
    catch (error) {
        console.error('Delete session error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to delete session',
        });
    }
});
exports.default = router;
//# sourceMappingURL=sessions.js.map