const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  try {
    const { token } = req.body;
    
    if(token !== process.env.ADMIN_TOKEN) {
      return res.status(401).json({ error: 'Token de acesso inválido' });
    }

    const authToken = jwt.sign(
      { 
        role: 'admin',
        system: 'gmadv',
        iss: 'Gabriel Mário Advogados' 
      }, 
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({ 
      token: authToken,
      message: 'Autenticação bem-sucedida' 
    });
    
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ 
      error: 'Erro interno no servidor',
      details: process.env.LOG_LEVEL === 'debug' ? error.message : null
    });
  }
};