const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const tokenHeader = req.headers['authorization'];

    if (!tokenHeader) {
        return res.status(403).json({ status: 'error', message: 'No token provided'});
    }

    try {
        const token = tokenHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_change_me');

        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized (Invalid Token)' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ status: 'error', message: 'Access Denied: Admin only'});
    }
};

module.exports = {verifyToken, isAdmin};