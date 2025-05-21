const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Post = require('./models/post');
const auth = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

// Sanitiza campos permitidos no corpo da requisição para prevenir dados indesejados
const sanitizePost = (req, res, next) => {
    const allowedFields = ['title', 'content', 'excerpt', 'category', 'status'];
    req.body = Object.keys(req.body).reduce((acc, key) => {
        if (allowedFields.includes(key)) acc[key] = req.body[key];
        return acc;
    }, {});
    next();
};

// Remove arquivo enviado em caso de erro na resposta, evitando arquivos órfãos
const handleFileCleanup = (req, res, next) => {
    res.on('finish', () => {
        if (req.file && res.statusCode >= 400) {
            fs.unlinkSync(req.file.path);
        }
    });
    next();
};

module.exports = (upload) => {
    /**
     * GET /api/posts
     * Lista posts paginados, retorna metadados de paginação
     */
    router.get('/', auth, sanitizePost, async (req, res) => {
        try {
            const { page = 1, limit = 10 } = req.query;
            const posts = await Post.find()
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit);

            const count = await Post.countDocuments();
            
            res.json({
                posts: posts.map(post => ({
                    _id: post._id,
                    title: post.title,
                    excerpt: post.excerpt,
                    category: post.category,
                    thumbnail: post.thumbnail,
                    status: post.status,
                    createdAt: post.createdAt
                })),
                totalPages: Math.ceil(count / limit),
                currentPage: parseInt(page)
            });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar posts' });
        }
    });

    /**
     * POST /api/posts
     * Cria um novo post com upload de imagem e sanitização dos campos
     */
    router.post('/', auth, upload.single('image'), handleFileCleanup, sanitizePost, async (req, res) => {
        try {
            const { title, content, excerpt, category } = req.body;
            
            const postData = {
                title,
                content,
                excerpt,
                category,
                thumbnail: req.file ? `/uploads/${req.file.filename}` : '',
                slug: title.toLowerCase()
                    .replace(/ /g, '-')
                    .replace(/[^a-z0-9-]/g, ''),
                status: 'published'
            };

            const post = new Post(postData);
            await post.save();
            
            res.status(201).json(post);
        } catch (error) {
            res.status(400).json({ 
                error: 'Erro ao criar post',
                details: error.message
            });
        }
    });

    /**
     * PUT /api/posts/:id
     * Atualiza um post existente, substitui imagem se fornecida
     */
    router.put('/:id', auth, upload.single('image'), handleFileCleanup, sanitizePost, async (req, res) => {
        try {
            const post = await Post.findById(req.params.id);
            if (!post) return res.status(404).json({ error: 'Post não encontrado' });

            // Prepara dados de atualização e nova slug
            const updateData = {
                ...req.body,
                slug: req.body.title.toLowerCase()
                    .replace(/ /g, '-')
                    .replace(/[^a-z0-9-]/g, '')
            };

            // Se houver novo arquivo, remove thumbnail antiga e atualiza caminho
            if (req.file) {
                if (post.thumbnail) {
                    const oldPath = path.join(__dirname, '../', post.thumbnail);
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
            res.status(400).json({ 
                error: 'Erro ao atualizar post',
                details: error.message
            });
        }
    });

    /**
     * DELETE /api/posts/:id
     * Remove post e arquivo de imagem associado
     */
    router.delete('/:id', auth, async (req, res) => {
        try {
            const post = await Post.findByIdAndDelete(req.params.id);
            
            // Se existir thumbnail, remove do sistema de arquivos
            if (post?.thumbnail) {
                const filePath = path.join(__dirname, '../', post.thumbnail);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }
            
            res.json({ message: 'Post excluído com sucesso' });
        } catch (error) {
            res.status(400).json({ 
                error: 'Erro ao excluir post',
                details: error.message
            });
        }
    });

    return router;
};
