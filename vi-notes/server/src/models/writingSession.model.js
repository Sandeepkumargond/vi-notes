import mongoose from 'mongoose';

const writingSessionSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        default: `New Note + ${new Date().toLocaleString()}`
    },
    content: {
        type: String,
        default: ''
    },
    totalTypedChars: {
        type: Number,
        default: 0
    },
    totalPastedChars: {
        type: Number,
        default: 0
    },
    pasteRatio: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'ended'],
        default: 'active'
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    endedAt: {
        type: Date
    }
}, { timestamps: true }
);

const writingSessionModel = mongoose.model('WritingSession', writingSessionSchema);

export default writingSessionModel;