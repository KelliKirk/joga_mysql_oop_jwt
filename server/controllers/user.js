const bcrypt = require('bcrypt');
const userModel = require('../models/users');
const userRoleModel = require('../models/userRole');
const { signToken } = require('../utils/jwt');

class userController {
    constructor() {
        this.register = this.register.bind(this);
        this.login = this.login.bind(this);
    }

    async register(req, res) {
        try {
            const { username, email, password, confirmPassword } = req.body;
            
            // Kontrollid
            if (!username || !email || !password || !confirmPassword) {
                return res.status(400).json({
                    error: 'Kõik väljad on kohustuslikud'
                });
            }

            if (username.length < 3) {
                return res.status(400).json({
                    error: 'Kasutajanimi peab olema vähemalt 3 tähemärki pikk'
                });
            }

            const existingUserByUsername = await userModel.findByUsername(username);
            if (existingUserByUsername) {
                return res.status(400).json({
                    error: 'See kasutajanimi on juba kasutusel'
                });
            }

            const existingUserByEmail = await userModel.findByEmail(email);
            if (existingUserByEmail) {
                return res.status(400).json({
                    error: 'See email on juba registreeritud'
                });
            }

            if (password.length < 16) {
                return res.status(400).json({
                    error: 'Parool peab olema vähemalt 16 tähemärki pikk'
                });
            }

            const hasUpperCase = /[A-Z]/.test(password);
            const hasLowerCase = /[a-z]/.test(password);
            const hasNumber = /[0-9]/.test(password);
            
            if (!hasUpperCase || !hasLowerCase || !hasNumber) {
                return res.status(400).json({
                    error: 'Parool peab sisaldama vähemalt ühte suurtähte, väiketähte ja numbrit'
                });
            }

            if (password !== confirmPassword) {
                return res.status(400).json({
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
                
                // Kontrolli, kas on admin
                const isAdmin = await userRoleModel.hasRole(userData.id, 'admin');
                
                // Genereeri JWT token
                const token = signToken({
                    user_id: userData.id,
                    username: userData.username,
                    email: userData.email,
                    is_admin: isAdmin
                });
                
                // Saada token koos kasutaja infoga
                return res.status(201).json({
                    message: 'Kasutaja edukalt registreeritud',
                    token: token,
                    user: {
                        user_id: userData.id,
                        username: userData.username,
                        email: userData.email,
                        is_admin: isAdmin
                    }
                });
            }
        } catch (error) {
            console.error('Register Error:', error);
            return res.status(500).json({
                error: 'Midagi läks valesti. Palun proovi uuesti.'
            });
        }
    }

    async login(req, res) {
        try {
            const { username, password } = req.body;
            
            if (!username || !password) {
                return res.status(400).json({
                    error: 'Kasutajanimi ja parool on kohustuslikud'
                });
            }

            const user = await userModel.findByUsername(username);
            
            if (!user) {
                return res.status(401).json({
                    error: 'Vale kasutajanimi või parool'
                });
            }

            const passwordMatch = await bcrypt.compare(password, user.password);
            
            if (!passwordMatch) {
                return res.status(401).json({
                    error: 'Vale kasutajanimi või parool'
                });
            }

            // Kontrolli, kas kasutaja on admin
            const isAdmin = await userRoleModel.hasRole(user.id, 'admin');
            
            // Genereeri JWT token
            const token = signToken({
                user_id: user.id,
                username: user.username,
                email: user.email,
                is_admin: isAdmin
            });
            
            console.log('User logged in:', user.username);
            
            // Saada token koos kasutaja infoga
            return res.json({
                message: 'Sisselogimine edukas',
                token: token,
                user: {
                    user_id: user.id,
                    username: user.username,
                    email: user.email,
                    is_admin: isAdmin
                }
            });
            
        } catch (error) {
            console.error('Login Error:', error);
            return res.status(500).json({
                error: 'Midagi läks valesti. Palun proovi uuesti.'
            });
        }
    }
} 

module.exports = new userController();