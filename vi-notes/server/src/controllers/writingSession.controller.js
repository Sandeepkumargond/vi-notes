import noteModel from '../models/notes.model.js';
import writingSessionModel from '../models/writingSession.model.js';

export const createWritingSession = async ({ userId, content = '', title }) => {
    const session = await writingSessionModel.create({
        author: userId,
        startedAt: new Date(),
        status: "active",
        content,
        title,
    });

    return session;
};

export const endWritingSessionById = async (req, res) => {
    const userId = req.userId;
    const sessionId = req.params.sessionId;

    const {
        title,
        content,
        totalTypedChars,
        totalPastedChars,
        pasteRatio
    } = req.body;

    try {
        const session = await writingSessionModel.findOneAndUpdate(
            {
                _id: sessionId,
                author: userId
            },
            {
                title,
                content,
                totalTypedChars,
                totalPastedChars,
                pasteRatio,
                status: 'ended',
                endedAt: new Date()
            },
            { returnDocument: 'after' }
        );

        if (!session) {
            return res.status(404).json({ error: 'Writing session not found' });
        }

        const note = await noteModel.findOneAndUpdate(
            {
                author: userId,
                // search the note by sessionId in the sessions array
                sessions: sessionId
            },
            { content, title },
            { returnDocument: 'after' }
        );

        if (!note) return res.status(404).json({ error: "Note not found for this session" });

        return res.status(200).json({
            message: "Writing session ended and note saved successfully",
            note: { id: note._id, title: note.title, content: note.content },
            session: { id: session._id, status: session.status, endedAt: session.endedAt },
        });
    } catch (error) {
        console.error('Error in endWritingSessionById:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getWritingSessionHistoryById = async (req, res) => {
    const userId = req.userId;
    const sessionId = req.params.sessionId;

    try {
        const session = await writingSessionModel.findById(sessionId);

        if (!session || session.length === 0) {
            return res.status(404).json({ error: 'No writing session found for this note' });
        }

        return res.status(200).json({
            message: "Writing session history retrieved successfully",
            session
        });

    } catch (error) {
        console.error('Error in getWritingSessionHistoryById:', error);
        res.status(500).json({ error: error.message });
    }
};