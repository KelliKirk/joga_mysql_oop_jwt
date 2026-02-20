const bcrypt = require('bcrypt');
const userModel = require('../models/users');
const userRoleModel = require('../models/userRole');

class userController {
    constructor() {
        this.register = this.register.bind(this);
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
        this.showRegisterForm = this.showRegisterForm.bind(this);
        this.showLoginForm = this.showLoginForm.bind(this);
    }

    showRegisterForm(req, res) {
        res.render('register', { 
            title: 'Registreerimine',
            error: null 
        });
    }

    showLoginForm(req, res) {
        res.render('login', { 
            title: 'Sisselogimine',
            error: null 
        });
    }

    async register(req, res) {
        try {
            const { username, email, password, confirmPassword } = req.body;
            
            // Kontrollid
            if (!username || !email || !password || !confirmPassword) {
                return res.render('register', {
                    title: 'Registreerimine',
                    error: 'Kõik väljad on kohustuslikud'
                });
            }

            if (username.length < 3) {
                return res.render('register', {
                    title: 'Registreerimine',
                    error: 'Kasutajanimi peab olema vähemalt 3 tähemärki pikk'
                });
            }

            const existingUserByUsername = await userModel.findByUsername(username);
            if (existingUserByUsername) {
                return res.render('register', {
                    title: 'Registreerimine',
                    error: 'See kasutajanimi on juba kasutusel'
                });
            }

            const existingUserByEmail = await userModel.findByEmail(email);
            if (existingUserByEmail) {
                return res.render('register', {
                    title: 'Registreerimine',
                    error: 'See email on juba registreeritud'
                });
            }

            if (password.length < 16) {
                return res.render('register', {
                    title: 'Registreerimine',
                    error: 'Parool peab olema vähemalt 16 tähemärki pikk'
                });
            }

            const hasUpperCase = /[A-Z]/.test(password);
            const hasLowerCase = /[a-z]/.test(password);
            const hasNumber = /[0-9]/.test(password);
            
            if (!hasUpperCase || !hasLowerCase || !hasNumber) {
                return res.render('register', {
                    title: 'Registreerimine',
                    error: 'Parool peab sisaldama vähemalt ühte suurtähte, väiketähte ja numbrit'
                });
            }

            if (password !== confirmPassword) {
                return res.render('register', {
                    title: 'Registreerimine',
                    error: 'Paroolid ei kattu'
                });
            }

            const cryptPassword = await bcrypt.hash(password, 10);
            
            const registeredId = await userModel.create({
                username: username,
                email: email,
                password: cryptPassword
            });

            if (registeredId) {
                const userData = await userModel.findById(registeredId);
                req.session.user = {
                    username: userData.username,
                    user_id: userData.id,
                    email: userData.email
                };
                
                // Redirect avalehele pärast edukat registreerimist
                res.redirect('/');
            }
        } catch (error) {
            console.error('Register Error:', error);
            res.render('register', {
                title: 'Registreerimine',
                error: 'Midagi läks valesti. Palun proovi uuesti.'
            });
        }
    }

    async login(req, res) {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.render('login', {
                title: 'Sisselogimine',
                error: 'Kasutajanimi ja parool on kohustuslikud'
            });
        }

        const user = await userModel.findByUsername(username);
        
        if (!user) {
            return res.render('login', {
                title: 'Sisselogimine',
                error: 'Vale kasutajanimi või parool'
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!passwordMatch) {
            return res.render('login', {
                title: 'Sisselogimine',
                error: 'Vale kasutajanimi või parool'
            });
        }

        // Kontrolli, kas kasutaja on admin
        const isAdmin = await userRoleModel.hasRole(user.id, 'admin');
        
        console.log('User ID:', user.id);
        console.log('Is admin check result:', isAdmin);

        req.session.user = {
            username: user.username,
            user_id: user.id,
            email: user.email,
            is_admin: isAdmin  
        };

        console.log('Session created:', req.session.user);

        res.redirect('/');
        
    } catch (error) {
        console.error('Login Error:', error);
        res.render('login', {
            title: 'Sisselogimine',
            error: 'Midagi läks valesti. Palun proovi uuesti.'
        });
    }
}

    logout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Logout error:', err);
            }
            res.redirect('/');
        });
    }
} 

module.exports = new userController();