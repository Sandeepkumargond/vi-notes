import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { createNote, deleteNoteById, getNotes, getNotesById, editNoteById } from '../controllers/note.controller.js';

const router = express.Router();

/** 
 * POST /api/v1/notes/create
 */
router.post('/create', authMiddleware, createNote);

/**
 * GET /api/v1/notes
 */
router.get('/', authMiddleware, getNotes);


/**
 * GET /api/v1/notes/:id
 */
router.get('/:id', authMiddleware, getNotesById);

/**
 * POST /api/v1/notes/:id
 * Edit a note by its ID
 */
router.post('/:id/edit', authMiddleware, editNoteById);

/**
 * DELETE /api/v1/notes/:id
 */
router.delete('/:id', authMiddleware, deleteNoteById);



export default router;