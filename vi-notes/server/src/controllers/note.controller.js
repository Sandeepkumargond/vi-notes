import noteModel from "../models/notes.model.js";
import { createWritingSession } from "./writingSession.controller.js";
import writingSessionModel from "../models/writingSession.model.js";

export const createNote = async (req, res) => {
    const userId = req.userId;
    const { title, content } = req.body;

    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    try {
        const note = await noteModel.create({
            title,
            content: content || '',
            author: userId,
            sessions: []
        });

        const session = await createWritingSession({ userId, content });

        note.sessions.push(session._id);
        await note.save();

        return res.status(201).json({
            message: "Note created successfully",
            note: {
                id: note._id,
                title: note.title,
                content: note.content,
                sessions: note.sessions,
            },
            session: {
                id: session._id,
                status: session.status,
                startedAt: session.startedAt,
                content: session.content,
            },
        });
    } catch (error) {
        console.error('Error in createNote:', error);
        res.status(500).json({ error: error.message });
    }

};

export const getNotes = async (req, res) => {
    const userId = req.userId;

    try {
        const notes = await noteModel.find({
            author: userId
        }).sort({ createdAt: -1 });

        res.status(200).json({
            message: 'Notes retrieved successfully',
            notes: notes
        });

    } catch (error) {
        console.error('Error in getNotes:', error);
        return res.status(500).json({ error: error.message });
    }
};

export const getNotesById = async (req, res) => {
    const userId = req.userId;

    const noteId = req.params.id;

    try {
        const note = await noteModel.findOne({
            author: userId,
            _id: noteId,
        });

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        const sessions = note.sessions.reverse(); // Show latest sessions first

        res.status(200).json({
            message: 'Note retrieved successfully',
            note: {
                id: note._id,
                title: note.title,
                content: note.content,
                sessions
            }
        });

    } catch (error) {
        console.error('Error in getNotesById:', error);
        return res.status(500).json({ error: error.message });
    }
};

export const deleteNoteById = async (req, res) => {
    const userId = req.userId;

    const noteId = req.params.id;

    try {
        const note = await noteModel.findOneAndDelete({
            author: userId,
            _id: noteId,
        });

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        res.status(200).json({
            message: 'Note deleted successfully',
        });

    } catch (error) {
        console.error('Error in deleteNoteById:', error);
        return res.status(500).json({ error: error.message });
    }
};

export const editNoteById = async (req, res) => {
    const userId = req.userId;
    const noteId = req.params.id;

    try {
        const note = await noteModel.findOne({
            _id: noteId,
            author: userId,
        });

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        // Reuse latest active session for this note+user (prevents duplicates)
        const activeSession = await writingSessionModel
            .findOne({
                _id: { $in: note.sessions },
                author: userId,
                status: "active",
            })
            .sort({ startedAt: -1 });

        if (activeSession) {
            return res.status(200).json({
                message: "Note editing resumed successfully",
                note: {
                    id: note._id,
                    title: note.title,
                    content: note.content,
                    sessions: note.sessions,
                },
                session: {
                    id: activeSession._id,
                    status: activeSession.status,
                    startedAt: activeSession.startedAt,
                    content: note.content,
                    title: note.title,
                },
            });
        }
        // console.log("note title:", note.title);
        // No active session found -> create a new one
        const session = await createWritingSession({ userId, title: note.title, content: note.content });
        // console.log("New writing session created for note editing:", session);

        note.sessions.push(session._id);
        await note.save();

        return res.status(200).json({
            message: "Note editing started successfully",
            note: {
                id: note._id,
                title: note.title,
                content: note.content,
                sessions: note.sessions,
            },
            session: {
                id: session._id,
                status: session.status,
                startedAt: session.startedAt,
                content: note.content,
            },
        });

    } catch (error) {
        console.error("Error in editNoteById:", error);
        return res.status(500).json({ error: error.message });
    }
};