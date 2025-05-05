const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Post = mongoose.model('Post');
const auth = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

const sanitizePost = (req, res, next) => {
    const allowedFields = ['title', 'content', 'excerpt', 'category', 'thumbnail', 'status'];
    req.body = Object.keys(req.body).reduce((acc, key) => {
        if (allowedFields.includes(key)) {
            acc[key] = req.body[key];
        }
        return acc;
    }, {});
    next();
};

const handleFileCleanup = (req, res, next) => {
    res.on('finish', () => {
        if (req.file && res.statusCode >= 400) {
            fs.unlinkSync(req.file.path);
        }
    });
    next();
};

module.exports = (upload) => {
    router.get('/', auth, async (req, res) => {
        try {
            const { page = 1, limit = 10 } = req.query;
            const posts = await Post.find()
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit);

            const count = await Post.countDocuments();
            
            res.json({
                posts,
                totalPages: Math.ceil(count / limit),
                currentPage: parseInt(page)
            });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar posts' });
        }
    });

    router.post('/', auth, sanitizePost, upload.single('thumbnail'), handleFileCleanup, async (req, res) => {
        try {
            const postData = {
                ...req.body,
                author: req.user.userId,
                slug: req.body.title
                    .toLowerCase()
                    .replace(/ /g, '-')
                    .replace(/[^\w-]+/g, '')
            };

            if (req.file) {
                postData.thumbnail = `/uploads/${req.file.filename}`;
            }

            const post = new Post(postData);
            await post.save();
            res.status(201).json(post);
        } catch (error) {
            res.status(400).json({ error: 'Erro ao criar post' });
        }
    });

    router.put('/:id', auth, sanitizePost, upload.single('thumbnail'), handleFileCleanup, async (req, res) => {
        try {
            const post = await Post.findById(req.params.id);
            if (!post) return res.status(404).json({ error: 'Post não encontrado' });

            const updateData = { ...req.body };
            
            if (req.file) {
                if (post.thumbnail) {
                    const oldPath = path.join(__dirname, '..', post.thumbnail);
                    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                }
                updateData.thumbnail = `/uploads/${req.file.filename}`;
            }

            const updatedPost = await Post.findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true, runValidators: true }
            );
            res.json(updatedPost);
        } catch (error) {
            res.status(400).json({ error: 'Erro ao atualizar post' });
        }
    });

    router.delete('/:id', auth, async (req, res) => {
        try {
            const post = await Post.findByIdAndDelete(req.params.id);
            
            if (post?.thumbnail) {
                const filePath = path.join(__dirname, '..', post.thumbnail);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }
            
            res.json({ message: 'Post excluído com sucesso' });
        } catch (error) {
            res.status(400).json({ error: 'Erro ao excluir post' });
        }
    });

    return router;
};