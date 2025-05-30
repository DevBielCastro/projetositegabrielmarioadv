// api/models/category.js
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, 'O nome da categoria é obrigatório.'],
        unique: true, // Garante que não haja categorias com o mesmo nome
        trim: true // Remove espaços em branco no início e no fim
    }
}, {
    timestamps: true // Adiciona os campos createdAt e updatedAt automaticamente
});

module.exports = mongoose.model('Category', CategorySchema);