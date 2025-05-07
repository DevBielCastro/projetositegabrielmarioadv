require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5500;

// ==================== CONFIGURAÇÕES INICIAIS ====================
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

// ==================== MIDDLEWARES ESSENCIAIS ====================
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

app.use(express.json());
app.use(cookieParser());
app.use(express.static(__dirname));
app.use('/uploads', express.static('uploads'));

// ==================== RATE LIMITING ====================
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  message: 'Muitas requisições deste IP - tente novamente mais tarde',
  skip: (req) => ['::1', '127.0.0.1'].includes(req.ip)
});
app.use('/api/', limiter);

// ==================== LOGS ====================
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'), { flags: 'a' }
);
const securityLogStream = fs.createWriteStream(
  path.join(logsDir, 'security.log'), { flags: 'a' }
);
app.use(morgan('combined', { stream: accessLogStream }));

app.use((req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode >= 400) {
      securityLogStream.write(
        `[${new Date().toISOString()}] ${req.ip} ${req.method} ${req.url} ${res.statusCode}\n`
      );
    }
  });
  next();
});

// ==================== CONEXÃO COM MONGODB ====================
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Conectado ao MongoDB'))
.catch(err => console.error('Erro de conexão:', err));

// ==================== MODELOS ====================
require('./api/models/post'); // Carrega o modelo Post primeiro

// ==================== CONFIGURAÇÃO DE UPLOAD ====================
const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// ==================== ROTAS ====================
app.post('/api/auth', require('./api/auth'));
app.use('/api/posts', require('./api/posts')(upload));

// Upload de imagens
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

// Rotas estáticas
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));

// ==================== TRATAMENTO DE ERROS ====================
app.use((req, res) => res.status(404).sendFile(path.join(__dirname, '404.html')));
app.use((err, req, res, next) => {
  console.error(err.stack);
  securityLogStream.write(`[${new Date().toISOString()}] ERRO ${err.stack}\n`);
  res.status(500).sendFile(path.join(__dirname, '500.html'));
});

// ==================== INICIALIZAÇÃO ====================
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  console.log(`Logs de acesso: ${path.join(logsDir, 'access.log')}`);
});