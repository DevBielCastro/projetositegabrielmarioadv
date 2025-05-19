const multer = require('multer');
const path = require('path');
const fs = require('fs');
const createError = require('http-errors');

// Configuração do diretório de uploads
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Criar diretório se não existir
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configuração do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// Filtro de arquivos
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(createError(400, 'Tipo de arquivo não suportado'), false);
  }
};

// Configuração final do upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Middleware de tratamento de erros
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return next(createError(400, 
      err.code === 'LIMIT_FILE_SIZE' 
        ? 'Arquivo muito grande (máx. 5MB)' 
        : 'Erro no upload do arquivo'
    ));
  }
  next(err);
};

module.exports = {
  uploadSingle: upload.single('image'),
  handleUploadErrors
};