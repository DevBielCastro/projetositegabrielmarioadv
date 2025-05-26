// server.js
// Arquivo principal do servidor backend com Express + MongoDB

require('dotenv').config({ path: './.env' }); // Carrega variáveis de ambiente no início

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
const porta = process.env.PORT || 5500;

// ================== LOGS ==================
const pastaDeLogs = path.join(__dirname, 'logs');
if (!fs.existsSync(pastaDeLogs)) fs.mkdirSync(pastaDeLogs);

const logAcesso = fs.createWriteStream(path.join(pastaDeLogs, 'access.log'), { flags: 'a' });
const logErros = fs.createWriteStream(path.join(pastaDeLogs, 'security.log'), { flags: 'a' });

// ================== SEGURANÇA ==================
app.use(helmet({
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

app.use(cors({
  origin: ['http://localhost:5500', 'http://192.168.0.7:5500'],
  credentials: true
}));

// ================== MIDDLEWARES ==================
app.use(express.json());
app.use(cookieParser());

// Arquivos estáticos (frontend)
app.use(express.static(path.join(__dirname)));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/blog', express.static(path.join(__dirname, 'blog')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ================== LIMITADOR DE REQUISIÇÕES ==================
const limiteDeRequisicoes = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  message: 'Muitas requisições - tente novamente mais tarde.',
  skip: req => ['::1', '127.0.0.1'].includes(req.ip)
});
app.use('/api/', limiteDeRequisicoes);

// ================== LOGS ==================
app.use(morgan('combined', { stream: logAcesso }));

app.use((req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode >= 400) {
      logErros.write(`[${new Date().toISOString()}] ${req.ip} ${req.method} ${req.originalUrl} ${res.statusCode}\n`);
    }
  });
  next();
});

// ================== CONEXÃO COM BANCO ==================
conectarAoBancoDeDados();

// ================== MODELOS ==================
require('./api/models/post');

// ================== UPLOAD ==================
const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// ================== ROTAS DE API ==================
app.post('/api/auth', require('./api/auth'));
app.use('/api/posts', require('./api/posts')(upload));

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ erro: 'Nenhuma imagem enviada.' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

// ================== ROTAS ESTÁTICAS ==================
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.get('/blog/post.html', (req, res) => res.sendFile(path.join(__dirname, 'blog/post.html')));

// ================== ERROS ==================
app.use((req, res) => res.status(404).sendFile(path.join(__dirname, '404.html')));

app.use((erro, req, res, next) => {
  console.error(erro.stack);
  logErros.write(`[${new Date().toISOString()}] ERRO ${erro.stack}\n`);
  res.status(500).sendFile(path.join(__dirname, '500.html'));
});

// ================== INICIALIZAÇÃO ==================
app.listen(porta, () => {
  console.log(`✅ Servidor iniciado em: http://localhost:${porta}`);
  console.log(`📄 Logs em: ${pastaDeLogs}`);
});
