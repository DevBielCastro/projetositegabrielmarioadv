// server.js
// Arquivo principal do servidor backend

require('dotenv').config({ path: __dirname + '/.env' });
console.log('DEBUG server.js → MONGODB_URI =', process.env.MONGODB_URI);

const express = require('express');
const multer = require('multer');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const limitarRequisicoes = require('express-rate-limit');
const protecaoCabecalhos = require('helmet');
const morgan = require('morgan');
const fs = require('fs');

// Conexão com o banco de dados MongoDB
const conectarAoBancoDeDados = require('./database');

const aplicativo = express();
const porta = process.env.PORT || 5500;

// ==================== CONFIGURAÇÕES DE LOGS ====================
const caminhoParaPastaDeLogs = path.join(__dirname, 'logs');
if (!fs.existsSync(caminhoParaPastaDeLogs)) fs.mkdirSync(caminhoParaPastaDeLogs);

const fluxoLogAcesso = fs.createWriteStream(path.join(caminhoParaPastaDeLogs, 'access.log'), { flags: 'a' });
const fluxoLogSeguranca = fs.createWriteStream(path.join(caminhoParaPastaDeLogs, 'security.log'), { flags: 'a' });

// ==================== MIDDLEWARES DE SEGURANÇA ====================
aplicativo.use(protecaoCabecalhos({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "cdn.tailwindcss.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"]
    }
  }
}));

aplicativo.use(cors({
  origin: ['http://localhost:5500', 'http://192.168.0.7:5500'],
  credentials: true
}));

// ==================== MIDDLEWARES GERAIS ====================
aplicativo.use(express.json());
aplicativo.use(cookieParser());
aplicativo.use(express.static(__dirname));
aplicativo.use('/uploads', express.static('uploads'));

// Rotas estáticas adicionais necessárias para funcionar o front corretamente
aplicativo.use('/assets', express.static(path.join(__dirname, 'assets')));
aplicativo.use('/blog', express.static(path.join(__dirname, 'blog')));

// ==================== LIMITE DE REQUISIÇÕES ====================
const configuracaoLimite = limitarRequisicoes({
  windowMs: 60 * 1000,
  max: 1000,
  message: 'Muitas requisições deste IP - tente novamente mais tarde',
  skip: (requisicao) => ['::1', '127.0.0.1'].includes(requisicao.ip)
});
aplicativo.use('/api/', configuracaoLimite);

// ==================== LOGS DE ACESSO E SEGURANÇA ====================
aplicativo.use(morgan('combined', { stream: fluxoLogAcesso }));

aplicativo.use((requisicao, resposta, proximo) => {
  resposta.on('finish', () => {
    if (resposta.statusCode >= 400) {
      fluxoLogSeguranca.write(
        `[${new Date().toISOString()}] ${requisicao.ip} ${requisicao.method} ${requisicao.url} ${resposta.statusCode}\n`
      );
    }
  });
  proximo();
});

// ==================== CONEXÃO COM BANCO DE DADOS ====================
conectarAoBancoDeDados();

// ==================== CARREGAMENTO DE MODELOS ====================
require('./api/models/post'); // Modelo de postagens

// ==================== CONFIGURAÇÃO DE UPLOAD ====================
const configuracaoUpload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: (requisicao, arquivo, callback) => {
      callback(null, Date.now() + path.extname(arquivo.originalname));
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// ==================== ROTAS DE API ====================
aplicativo.post('/api/auth', require('./api/auth'));
aplicativo.use('/api/posts', require('./api/posts')(configuracaoUpload));

// Upload de imagens
aplicativo.post('/api/upload', configuracaoUpload.single('image'), (requisicao, resposta) => {
  if (!requisicao.file) return resposta.status(400).json({ erro: 'Nenhuma imagem enviada' });
  resposta.json({ url: `/uploads/${requisicao.file.filename}` });
});

// ==================== ROTAS ESTÁTICAS ====================
aplicativo.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
aplicativo.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
aplicativo.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
aplicativo.get('/blog/post.html', (req, res) => res.sendFile(path.join(__dirname, 'blog/post.html'))); // garante o funcionamento direto

// ==================== TRATAMENTO DE ERROS ====================
aplicativo.use((req, res) => res.status(404).sendFile(path.join(__dirname, '404.html')));
aplicativo.use((erro, req, res, proximo) => {
  console.error(erro.stack);
  fluxoLogSeguranca.write(`[${new Date().toISOString()}] ERRO ${erro.stack}\n`);
  res.status(500).sendFile(path.join(__dirname, '500.html'));
});

// ==================== INICIALIZAÇÃO DO SERVIDOR ====================
aplicativo.listen(porta, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${porta}`);
  console.log(`📁 Logs de acesso: ${path.join(caminhoParaPastaDeLogs, 'access.log')}`);
});
