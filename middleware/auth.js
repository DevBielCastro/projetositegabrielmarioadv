const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        
        if (!token) return res.redirect('/login');

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Adicionando user ID ao request
        req.user = {
            userId: decoded.userId,
            role: decoded.role
        };

        if (decoded.role !== 'admin') return res.redirect('/login');
        
        next();
    } catch (error) {
        console.error('Erro de autenticação:', error);
        res.redirect('/login');
    }
};