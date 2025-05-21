// Módulo de autenticação: valida token de acesso e emite JWT para cliente
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  try {
    // Extrai token enviado no corpo da requisição
    const { token } = req.body;
    
    // Verifica se o token corresponde ao token de administrador configurado
    if (token !== process.env.ADMIN_TOKEN) {
      return res.status(401).json({ error: 'Token de acesso inválido' });
    }

    // Gera JWT contendo permissões e metadados do sistema
    const authToken = jwt.sign(
      {
        role: 'admin',              // Perfil de acesso
        system: 'gmadv',            // Identificador do sistema
        iss: 'Gabriel Mário Advogados' // Emissor do token
      },
      process.env.JWT_SECRET,      // Chave secreta para assinatura
      { expiresIn: process.env.JWT_EXPIRES_IN } // Tempo de expiração
    );

    // Retorna o token gerado e mensagem de sucesso
    res.json({
      token: authToken,
      message: 'Autenticação bem-sucedida'
    });

  } catch (error) {
    // Em caso de exceção, registra no console e retorna erro genérico
    console.error('Erro no login:', error);
    res.status(500).json({
      error: 'Erro interno no servidor',
      // Incluir detalhes do erro apenas em modo debug
      details: process.env.LOG_LEVEL === 'debug' ? error.message : null
    });
  }
};
