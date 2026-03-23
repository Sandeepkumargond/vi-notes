import { Router, Response } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import { WritingSessionModel, SessionReportModel } from '../models';
import { analyzeSession, wordCount, characterCount } from '../utils';
import { ApiResponse, WritingSession, SessionReport } from '../types/definitions';

const router = Router();

// Save Writing Session (Feature #5)
router.post('/sessions', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { content, keystrokes, pasteEvents, startTime, endTime } = req.body;

    // Validation
    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required',
      } as ApiResponse<null>);
    }

    const wCount = wordCount(content);
    const cCount = characterCount(content);
    const endTimeDate = endTime ? new Date(endTime) : new Date();
    const startTimeDate = new Date(startTime || Date.now());
    const totalDuration = Math.floor(
      (endTimeDate.getTime() - startTimeDate.getTime()) / 1000
    );

    const session = await WritingSessionModel.create({
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
    
    const analysis = analyzeSession(
      keystrokes || [],
      pasteEvents || [],
      cCount,
      keystrokeCount
    );

    // Create session report
    const report = await SessionReportModel.create({
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
  } catch (error) {
    console.error('Save session error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to save session',
    } as ApiResponse<null>);
  }
});

// Get Writing Session
router.get('/sessions/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const session = await WritingSessionModel.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      } as ApiResponse<null>);
    }

    if (session.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
      } as ApiResponse<null>);
    }

    return res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('Get session error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch session',
    } as ApiResponse<null>);
  }
});

// Get User's Sessions
router.get('/sessions', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const sessions = await WritingSessionModel.find({ userId: req.userId })
      .select('-content')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch sessions',
    } as ApiResponse<null>);
  }
});

// Get Session Report
router.get('/reports/:sessionId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const report = await SessionReportModel.findOne({
      sessionId: req.params.sessionId,
      userId: req.userId,
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found',
      } as ApiResponse<null>);
    }

    return res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Get report error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch report',
    } as ApiResponse<null>);
  }
});

// Delete Session
router.delete('/sessions/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const session = await WritingSessionModel.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      } as ApiResponse<null>);
    }

    if (session.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
      } as ApiResponse<null>);
    }

    await WritingSessionModel.deleteOne({ _id: req.params.id });
    await SessionReportModel.deleteOne({ sessionId: req.params.id });

    return res.status(200).json({
      success: true,
      message: 'Session deleted successfully',
    });
  } catch (error) {
    console.error('Delete session error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete session',
    } as ApiResponse<null>);
  }
});

export default router;
