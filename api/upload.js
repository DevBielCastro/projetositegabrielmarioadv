// Configuração de armazenamento para uploads via multer
const multer = require('multer');
const path = require('path');

// Define onde e como os arquivos serão salvos no sistema de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Pasta de destino para todos os uploads
  },
  filename: (req, file, cb) => {
    // Gera nome único usando timestamp e número aleatório
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtra apenas arquivos de imagem, rejeitando outros tipos
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true); // Aceita arquivo se for imagem
  } else {
    cb(new Error('Apenas imagens são permitidas!'), false); // Rejeita outros tipos
  }
};

// Configurações finais do multer: storage, filtro e limite de tamanho
const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Tamanho máximo: 5MB
});

module.exports = upload;
