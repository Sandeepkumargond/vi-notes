import express from 'express';
import { endWritingSessionById, getWritingSessionHistoryById } from '../controllers/writingSession.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * POST /api/v1/sessions/:sessionId/end
 */
router.post('/:sessionId/end', authMiddleware , endWritingSessionById);

/**
 * GET /api/v1/sessions/:sessionId/history
 */
router.get('/:sessionId/history', authMiddleware, getWritingSessionHistoryById);


export default router;