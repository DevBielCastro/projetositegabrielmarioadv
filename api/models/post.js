// api/models/Post.js
const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    excerpt: { type: String, required: true },
    category: { type: String, required: true },
    thumbnail: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    author: { type: String, default: 'Gabriel Mário' },
    slug: { type: String, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);