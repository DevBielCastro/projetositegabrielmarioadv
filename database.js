// database.js
// Módulo de conexão com MongoDB usando Mongoose em conformidade com boas práticas

const mongoose = require('mongoose');

// URI de conexão obtida a partir do arquivo .env
const uriMongoDB = process.env.MONGODB_URI;

// Verificação de segurança: URI deve estar definida
if (!uriMongoDB) {
  console.error('❌ Erro: MONGODB_URI não definida nas variáveis de ambiente.');
  process.exit(1);
}

/**
 * Estabelece a conexão com o banco de dados MongoDB.
 */
async function conectarAoBancoDeDados() {
  try {
    await mongoose.connect(uriMongoDB);
    console.log('✅ Conectado ao MongoDB com sucesso.');
  } catch (erro) {
    console.error('❌ Falha na conexão com o MongoDB:', erro.message);
    process.exit(1);
  }
}

module.exports = conectarAoBancoDeDados;
