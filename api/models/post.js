// Definição do schema para artigos (Posts) no MongoDB usando Mongoose
const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true          // Título do artigo, obrigatório
    },
    content: { 
        type: String, 
        required: true          // Conteúdo completo do artigo, obrigatório
    },
    excerpt: { 
        type: String, 
        required: true          // Resumo breve do artigo, obrigatório
    },
    category: { 
        type: String, 
        required: true          // Categoria de atuação, obrigatório
    },
    thumbnail: { 
        type: String, 
        default: ''             // URL da imagem de capa, padrão vazio
    },
    status: { 
        type: String, 
        enum: ['draft', 'published'], // Apenas rascunho ou publicado
        default: 'draft'        // Padrão inicial como rascunho
    },
    author: { 
        type: String, 
        default: 'Gabriel Mário' // Autor padrão
    },
    slug: { 
        type: String, 
        unique: true            // Identificador único na URL
    }
}, { 
    timestamps: true            // Cria campos createdAt e updatedAt automaticamente
});

// Exporta o modelo para ser utilizado nas rotas de CRUD de posts
module.exports = mongoose.model('Post', PostSchema);
