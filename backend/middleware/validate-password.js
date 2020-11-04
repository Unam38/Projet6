const passwordValidator = require('password-validator');

const passwordFormat = new passwordValidator();

passwordFormat.is().min(6)
.is().max(100)
.has().uppercase()
.has().lowercase()
.has().digits()
.has().not().spaces()
.is().not().oneOf(['123456', '987654', 'password', 'Password']);

module.exports = (res, req, next) => {
    if(passwordFormat.validate(req.body.password)){
        next();
    } else {
        res.status(400).json({error: 'mot de passe trop simple!' });
    }
};