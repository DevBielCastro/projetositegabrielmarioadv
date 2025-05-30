// server.js
// Ponto de entrada principal para o servidor backend.
// Anotações sobre o server.js para referência:

// Carrega as variáveis de ambiente do arquivo .env, fundamental para configurações.
require('dotenv').config({ path: './.env' });

const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const conectarAoBancoDeDados = require('./database');

const app = express();
const porta = process.env.PORT || 3000;

// --- CONFIGURAÇÃO DE LOGS EM ARQUIVO ---
const pastaDeLogs = path.join(__dirname, 'logs');
if (!fs.existsSync(pastaDeLogs)) {
  fs.mkdirSync(pastaDeLogs);
}

const fluxoLogRequisicoes = fs.createWriteStream(path.join(pastaDeLogs, 'requisicoes.log'), { flags: 'a' });
const fluxoLogErrosServidor = fs.createWriteStream(path.join(pastaDeLogs, 'erros_seguranca.log'), { flags: 'a' });

// --- MIDDLEWARES DE SEGURANÇA ---
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "cdn.tailwindcss.com",
        "https://unpkg.com",
        "https://kit.fontawesome.com"
      ],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "cdnjs.cloudflare.com",
        "https://unpkg.com",
        "https://fonts.googleapis.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://cdnjs.cloudflare.com"
      ],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
      formAction: ["'self'"]
    }
  }
}));

app.use(cors({
  origin: ['http://localhost:5500', `http://localhost:${porta}`, 'http://127.0.0.1:5500', `http://127.0.0.1:${porta}`],
  credentials: true
}));

// --- MIDDLEWARES ESSENCIAIS ---
app.use(express.json());
app.use(cookieParser());

// --- SERVIR ARQUIVOS ESTÁTICOS ---
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/blog', express.static(path.join(__dirname, 'blog')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- LIMITADOR DE REQUISIÇÕES (Rate Limiting) ---
const limiteDeRequisicoesApi = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { erro: 'Muitas requisições originadas deste IP, por favor, tente novamente após 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (requisicao) => ['::1', '127.0.0.1'].includes(requisicao.ip)
});
app.use('/api/', limiteDeRequisicoesApi);

// --- LOGGING DE REQUISIÇÕES HTTP (Morgan) ---
app.use(morgan('combined', { stream: fluxoLogRequisicoes }));

app.use((requisicao, resposta, proximo) => {
  resposta.on('finish', () => {
    if (resposta.statusCode >= 400) {
      const logMensagem = `[${new Date().toISOString()}] IP: ${requisicao.ip} - ${requisicao.method} ${requisicao.originalUrl} - Status: ${resposta.statusCode} - Agente: ${requisicao.get('User-Agent')}\n`;
      fluxoLogErrosServidor.write(logMensagem);
    }
  });
  proximo();
});

// --- CONEXÃO COM O BANCO DE DADOS ---
conectarAoBancoDeDados();

// --- CARREGAR MODELOS (Schemas do Mongoose) ---
require('./api/models/post');
require('./api/models/category');

// --- CONFIGURAÇÃO DO MULTER (Upload de Arquivos) ---
const armazenamentoDeUploads = multer.diskStorage({
  destination: (requisicao, arquivo, callback) => {
    callback(null, 'uploads/');
  },
  filename: (requisicao, arquivo, callback) => {
    callback(null, Date.now() + path.extname(arquivo.originalname));
  }
});

const uploadConfigurado = multer({
  storage: armazenamentoDeUploads,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// --- ROTAS DA API ---
app.use('/api/auth', require('./api/auth'));
app.use('/api/posts', require('./api/posts')(uploadConfigurado));
app.use('/api/categories', require('./api/routes/categories')); 

app.post('/api/upload', uploadConfigurado.single('image'), (requisicao, resposta) => {
  if (!requisicao.file) {
    return resposta.status(400).json({ erro: 'Nenhuma imagem foi enviada.' });
  }
  resposta.json({ url: `/uploads/${requisicao.file.filename}` });
});

// --- ROTAS PARA SERVIR ARQUIVOS HTML PRINCIPAIS ---
app.get('/', (requisicao, resposta) => resposta.sendFile(path.join(__dirname, 'index.html')));
app.get('/index.html', (requisicao, resposta) => resposta.sendFile(path.join(__dirname, 'index.html'))); 

// Rota específica para /login.html (para corresponder ao link no index.html)
app.get('/login.html', (requisicao, resposta) => {
  resposta.sendFile(path.join(__dirname, 'login.html'));
});
// Rota opcional para /login (sem .html) servindo o mesmo arquivo.
app.get('/login', (requisicao, resposta) => {
  resposta.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/admin.html', (requisicao, resposta) => {
  resposta.sendFile(path.join(__dirname, 'admin.html'));
});
app.get('/admin', (requisicao, resposta) => {
  resposta.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/blog/post.html', (requisicao, resposta) => resposta.sendFile(path.join(__dirname, 'blog', 'post.html')));

// --- TRATAMENTO DE ERROS ---
app.use((requisicao, resposta) => {
  resposta.status(404).sendFile(path.join(__dirname, '404.html'));
});

app.use((erro, requisicao, resposta, proximo) => {
  console.error('Ocorreu um erro no servidor:', erro.stack);
  fluxoLogErrosServidor.write(`[${new Date().toISOString()}] ERRO GRAVE: ${erro.stack}\n`);
  const mensagemCliente = process.env.NODE_ENV === 'development' ? erro.message : 'Ocorreu um erro interno no servidor. Por favor, tente mais tarde.';
  if (resposta.headersSent) {
    return proximo(erro);
  }
  const caminhoPagina500 = path.join(__dirname, '500.html');
  if (fs.existsSync(caminhoPagina500)) {
    resposta.status(500).sendFile(caminhoPagina500);
  } else {
    resposta.status(500).json({ erro: mensagemCliente });
  }
});

// --- INICIALIZAÇÃO DO SERVIDOR ---
app.listen(porta, () => {
  console.log(`✅ Servidor Node.js iniciado.`);
  console.log(`🚀 Escutando em: http://localhost:${porta}`);
  console.log(`📝 Logs de requisições: ${path.join(pastaDeLogs, 'requisicoes.log')}`);
  console.log(`🚨 Logs de erros: ${path.join(pastaDeLogs, 'erros_seguranca.log')}`);
});