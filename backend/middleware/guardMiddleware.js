const guard = (req, res, next) => {
    if (req.user && req.user.role === 'guard') {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as a guard');
    }
};

module.exports = { guard };
