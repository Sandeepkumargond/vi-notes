import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        default: ''
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sessions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WritingSession'
    }]
}, { timestamps: true }
);

const noteModel = mongoose.model('Note', noteSchema);

export default noteModel;