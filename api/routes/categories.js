// api/routes/categories.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Category = mongoose.model('Category'); // Carrega o modelo Category
const authMiddleware = require('../../middleware/auth'); // Ajuste o caminho se o seu middleware/auth.js estiver em outro lugar

// ROTA: GET /api/categories - Listar todas as categorias
router.get('/', authMiddleware, async (req, res) => {
    try {
        const categories = await Category.find().sort({ nome: 1 }); // Ordena por nome
        res.json({ categories }); // Retorna um objeto com uma chave "categories" contendo o array
    } catch (erro) {
        console.error("Erro ao buscar categorias:", erro);
        res.status(500).json({ erro: 'Erro interno ao buscar categorias.' });
    }
});

// ROTA: POST /api/categories - Criar uma nova categoria
router.post('/', authMiddleware, async (req, res) => {
    const { nome } = req.body;
    if (!nome || nome.trim() === '') {
        return res.status(400).json({ erro: 'O nome da categoria é obrigatório.' });
    }
    try {
        const novaCategoria = new Category({ nome: nome.trim() });
        await novaCategoria.save();
        res.status(201).json(novaCategoria);
    } catch (erro) {
        console.error("Erro ao criar categoria:", erro);
        if (erro.code === 11000) { // Erro de chave duplicada (nome já existe)
            return res.status(400).json({ erro: 'Uma categoria com este nome já existe.' });
        }
        if (erro.name === 'ValidationError') {
            return res.status(400).json({ erro: 'Dados inválidos.', detalhes: erro.errors });
        }
        res.status(500).json({ erro: 'Erro interno ao criar a categoria.' });
    }
});

// ROTA: PUT /api/categories/:id - Atualizar uma categoria existente
router.put('/:id', authMiddleware, async (req, res) => {
    const { nome } = req.body;
    const { id } = req.params;

    if (!nome || nome.trim() === '') {
        return res.status(400).json({ erro: 'O nome da categoria é obrigatório para atualização.' });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ erro: 'ID da categoria inválido.' });
    }

    try {
        const categoriaAtualizada = await Category.findByIdAndUpdate(
            id,
            { nome: nome.trim() },
            { new: true, runValidators: true } // Retorna o documento atualizado e roda validadores
        );
        if (!categoriaAtualizada) {
            return res.status(404).json({ erro: 'Categoria não encontrada para atualização.' });
        }
        res.json(categoriaAtualizada);
    } catch (erro) {
        console.error("Erro ao atualizar categoria:", erro);
        if (erro.code === 11000) {
            return res.status(400).json({ erro: 'Já existe outra categoria com este nome.' });
        }
        if (erro.name === 'ValidationError') {
            return res.status(400).json({ erro: 'Dados inválidos.', detalhes: erro.errors });
        }
        res.status(500).json({ erro: 'Erro interno ao atualizar a categoria.' });
    }
});

// ROTA: DELETE /api/categories/:id - Excluir uma categoria
router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ erro: 'ID da categoria inválido.' });
    }

    try {
        const categoriaExcluida = await Category.findByIdAndDelete(id);
        if (!categoriaExcluida) {
            return res.status(404).json({ erro: 'Categoria não encontrada para exclusão.' });
        }
        // Opcional: Você pode querer verificar se algum post usa esta categoria
        // e talvez impedir a exclusão ou remover a categoria dos posts.
        // Por simplicidade, aqui apenas excluímos a categoria.
        res.json({ mensagem: 'Categoria excluída com sucesso.' });
    } catch (erro) {
        console.error("Erro ao excluir categoria:", erro);
        res.status(500).json({ erro: 'Erro interno ao excluir a categoria.' });
    }
});

module.exports = router;