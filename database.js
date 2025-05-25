// database.js
// Configuração de conexão com MongoDB utilizando Mongoose em conformidade com boas práticas de código limpo

const mongoose = require('mongoose');

// URI de conexão extraída das variáveis de ambiente
const uriMongoDB = process.env.MONGODB_URI;

// Validação da existência da variável de ambiente
if (!uriMongoDB) {
  console.error('❌ Variável de ambiente MONGODB_URI não definida.');
  process.exit(1);
}

/**
 * Estabelece conexão com o MongoDB.
 */
async function conectarAoBancoDeDados() {
  try {
    await mongoose.connect(uriMongoDB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conexão com o MongoDB estabelecida com sucesso.');
  } catch (erro) {
    console.error('❌ Falha ao conectar ao MongoDB:', erro.message);
    process.exit(1);
  }
}

module.exports = conectarAoBancoDeDados;
