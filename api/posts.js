// api/posts.js
// Define as rotas para o CRUD (Create, Read, Update, Delete) de posts.

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Post = mongoose.model('Post'); // O modelo 'Post' já foi carregado em server.js
const authMiddleware = require('../middleware/auth'); // (Este arquivo não foi fornecido, mas é referenciado)
const fs = require('fs');
const path = require('path');

// Middleware para sanitizar os campos permitidos no corpo da requisição.
// Evita que campos não esperados sejam salvos no banco de dados.
const sanitizarCorpoPost = (requisicao, resposta, proximo) => {
    const camposPermitidos = ['title', 'content', 'excerpt', 'category', 'status'];
    // Se a requisição tiver corpo (POST, PUT), filtra apenas os campos permitidos.
    if (requisicao.body) {
        const corpoSanitizado = {};
        for (const campo of camposPermitidos) {
            if (requisicao.body[campo] !== undefined) {
                corpoSanitizado[campo] = requisicao.body[campo];
            }
        }
        requisicao.body = corpoSanitizado;
    }
    proximo();
};

// Middleware para limpar arquivos de upload em caso de erro na resposta.
// Previne arquivos órfãos no servidor se a operação no banco falhar.
const limparArquivoEmCasoDeErro = (requisicao, resposta, proximo) => {
    resposta.on('finish', () => {
        if (requisicao.file && resposta.statusCode >= 400) {
            // Se houve upload de arquivo e a resposta é um erro, remove o arquivo.
            fs.unlink(requisicao.file.path, (erroAoRemover) => {
                if (erroAoRemover) {
                    console.error('Erro ao remover arquivo órfão:', requisicao.file.path, erroAoRemover);
                }
            });
        }
    });
    proximo();
};

module.exports = (uploadConfigurado) => { // Recebe a configuração do Multer de server.js

    /**
     * GET /api/posts/public
     * Lista posts publicados para o público, com paginação.
     * Não requer autenticação.
     */
    router.get('/public', async (requisicao, resposta) => {
        try {
            const pagina = parseInt(requisicao.query.page) || 1;
            const limite = parseInt(requisicao.query.limit) || 3; // Limite padrão para "recentes"

            const posts = await Post.find({ status: 'published' }) // Apenas posts publicados.
                .sort({ createdAt: -1 }) // Ordena pelos mais recentes.
                .limit(limite)
                .skip((pagina - 1) * limite)
                // Seleciona apenas os campos necessários para a listagem pública.
                .select('title excerpt category thumbnail slug createdAt');

            const totalPosts = await Post.countDocuments({ status: 'published' });

            resposta.json({
                posts,
                totalPaginas: Math.ceil(totalPosts / limite),
                paginaAtual: pagina
            });
        } catch (erro) {
            console.error('Erro ao buscar posts públicos:', erro);
            resposta.status(500).json({ erro: 'Erro interno ao buscar posts públicos.' });
        }
    });
    
    /**
     * GET /api/posts/public/slug/:slug
     * Busca um único post público pelo seu slug.
     * Não requer autenticação.
     */
    router.get('/public/slug/:slug', async (requisicao, resposta) => {
        try {
            const post = await Post.findOne({ slug: requisicao.params.slug, status: 'published' })
                                     .select('-__v'); // Exclui o campo __v

            if (!post) {
                return resposta.status(404).json({ erro: 'Post não encontrado ou não está publicado.' });
            }
            resposta.json(post);
        } catch (erro) {
            console.error('Erro ao buscar post público por slug:', erro);
            resposta.status(500).json({ erro: 'Erro interno ao buscar o post.' });
        }
    });


    /**
     * GET /api/posts/admin
     * Lista todos os posts (rascunhos e publicados) para o painel de administração.
     * Requer autenticação.
     */
    router.get('/admin', authMiddleware, async (requisicao, resposta) => { // Protegido pelo authMiddleware
        try {
            const pagina = parseInt(requisicao.query.page) || 1;
            const limite = parseInt(requisicao.query.limit) || 10;

            const posts = await Post.find() // Busca todos os posts, sem filtrar por status.
                .sort({ createdAt: -1 })
                .limit(limite)
                .skip((pagina - 1) * limite)
                // Seleciona campos para o painel de admin.
                .select('title excerpt category thumbnail status createdAt');

            const totalPosts = await Post.countDocuments();

            resposta.json({
                posts,
                totalPaginas: Math.ceil(totalPosts / limite),
                paginaAtual: pagina
            });
        } catch (erro) {
            console.error('Erro ao buscar posts para admin:', erro);
            resposta.status(500).json({ erro: 'Erro interno ao buscar posts para administração.' });
        }
    });

    /**
     * POST /api/posts
     * Cria um novo post.
     * Requer autenticação e lida com upload de imagem.
     */
    router.post('/',
        authMiddleware,
        uploadConfigurado.single('image'), // Middleware do Multer para um único arquivo no campo 'image'.
        limparArquivoEmCasoDeErro,
        sanitizarCorpoPost, // Aplica a sanitização antes de processar.
        async (requisicao, resposta) => {
            try {
                const { title, content, excerpt, category, status } = requisicao.body;

                // Validações básicas (podem ser expandidas ou movidas para o schema Mongoose)
                if (!title || !content || !excerpt || !category) {
                    return resposta.status(400).json({ erro: 'Campos obrigatórios (título, conteúdo, resumo, categoria) não foram preenchidos.' });
                }

                const dadosPost = {
                    title,
                    content,
                    excerpt,
                    category,
                    // Se um status foi enviado e é válido, usa ele.
                    // Caso contrário, o Mongoose usará o default 'draft' do schema.
                    status: (status && ['draft', 'published'].includes(status)) ? status : undefined,
                    thumbnail: requisicao.file ? `/uploads/${requisicao.file.filename}` : '',
                    // Gera um slug a partir do título.
                    slug: title.toLowerCase()
                        .replace(/\s+/g, '-') // Substitui espaços por hífens.
                        .replace(/[^\w-]+/g, '') // Remove caracteres não alfanuméricos (exceto hífen).
                        .replace(/--+/g, '-') // Substitui múltiplos hífens por um só.
                        .replace(/^-+|-+$/g, '') // Remove hífens no início ou fim.
                };

                const novoPost = new Post(dadosPost);
                await novoPost.save();

                resposta.status(201).json(novoPost);
            } catch (erro) {
                console.error('Erro ao criar post:', erro);
                // Verifica se é um erro de validação do Mongoose ou duplicidade de slug
                if (erro.name === 'ValidationError') {
                    return resposta.status(400).json({ erro: 'Dados inválidos.', detalhes: erro.errors });
                }
                if (erro.code === 11000) { // Código de erro para chave duplicada (slug)
                    return resposta.status(400).json({ erro: 'Já existe um post com este título (slug duplicado).' });
                }
                resposta.status(500).json({
                    erro: 'Erro interno ao criar o post.',
                    detalhes: erro.message
                });
            }
        }
    );

    /**
     * PUT /api/posts/:id
     * Atualiza um post existente.
     * Requer autenticação e pode lidar com substituição de imagem.
     */
    router.put('/:id',
        authMiddleware,
        uploadConfigurado.single('image'),
        limparArquivoEmCasoDeErro,
        sanitizarCorpoPost,
        async (requisicao, resposta) => {
            try {
                const { title, content, excerpt, category, status } = requisicao.body;
                const postId = requisicao.params.id;

                if (!mongoose.Types.ObjectId.isValid(postId)) {
                    return resposta.status(400).json({ erro: 'ID do post inválido.' });
                }
                
                const postExistente = await Post.findById(postId);
                if (!postExistente) {
                    return resposta.status(404).json({ erro: 'Post não encontrado.' });
                }

                // Prepara dados para atualização.
                const dadosAtualizacao = { title, content, excerpt, category, status };
                if (title) { // Se o título for alterado, o slug também precisa ser.
                    dadosAtualizacao.slug = title.toLowerCase()
                        .replace(/\s+/g, '-')
                        .replace(/[^\w-]+/g, '')
                        .replace(/--+/g, '-')
                        .replace(/^-+|-+$/g, '');
                }

                // Se uma nova imagem foi enviada, remove a antiga (se existir) e atualiza o caminho.
                if (requisicao.file) {
                    if (postExistente.thumbnail && postExistente.thumbnail !== '') {
                        const caminhoThumbnailAntigo = path.join(__dirname, '../', postExistente.thumbnail);
                        if (fs.existsSync(caminhoThumbnailAntigo)) {
                            fs.unlink(caminhoThumbnailAntigo, erroAoRemover => {
                                if(erroAoRemover) console.error("Erro ao remover thumbnail antiga:", erroAoRemover);
                            });
                        }
                    }
                    dadosAtualizacao.thumbnail = `/uploads/${requisicao.file.filename}`;
                }

                const postAtualizado = await Post.findByIdAndUpdate(
                    postId,
                    { $set: dadosAtualizacao }, // Usa $set para garantir que apenas os campos fornecidos sejam atualizados.
                    { new: true, runValidators: true } // Retorna o documento atualizado e executa validadores do schema.
                );

                resposta.json(postAtualizado);
            } catch (erro) {
                console.error('Erro ao atualizar post:', erro);
                 if (erro.name === 'ValidationError') {
                    return resposta.status(400).json({ erro: 'Dados inválidos para atualização.', detalhes: erro.errors });
                }
                if (erro.code === 11000) {
                    return resposta.status(400).json({ erro: 'Já existe um post com este título (slug duplicado).' });
                }
                resposta.status(500).json({
                    erro: 'Erro interno ao atualizar o post.',
                    detalhes: erro.message
                });
            }
        }
    );

    /**
     * DELETE /api/posts/:id
     * Remove um post e sua imagem associada.
     * Requer autenticação.
     */
    router.delete('/:id', authMiddleware, async (requisicao, resposta) => {
        try {
            const postId = requisicao.params.id;

            if (!mongoose.Types.ObjectId.isValid(postId)) {
                return resposta.status(400).json({ erro: 'ID do post inválido.' });
            }

            const postRemovido = await Post.findByIdAndDelete(postId);

            if (!postRemovido) {
                return resposta.status(404).json({ erro: 'Post não encontrado para exclusão.' });
            }

            // Se o post tinha uma thumbnail, remove o arquivo do servidor.
            if (postRemovido.thumbnail && postRemovido.thumbnail !== '') {
                const caminhoThumbnail = path.join(__dirname, '../', postRemovido.thumbnail);
                if (fs.existsSync(caminhoThumbnail)) {
                    fs.unlink(caminhoThumbnail, erroAoRemover => {
                         if(erroAoRemover) console.error("Erro ao remover thumbnail do post excluído:", erroAoRemover);
                    });
                }
            }

            resposta.json({ mensagem: 'Post excluído com sucesso.' });
        } catch (erro) {
            console.error('Erro ao excluir post:', erro);
            resposta.status(500).json({
                erro: 'Erro interno ao excluir o post.',
                detalhes: erro.message
            });
        }
    });

    return router;
};