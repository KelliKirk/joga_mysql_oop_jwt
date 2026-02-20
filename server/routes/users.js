const express = require('express');
const userController = require('../controllers/user');

class UserRouter {
    constructor() {
        this.router = express.Router();
        this.controller = userController;
        this.initRoutes();
    }
    
    initRoutes() {
        // Vormide kuvamine
        this.router.get('/register', this.controller.showRegisterForm);
        this.router.get('/login', this.controller.showLoginForm);
        
        // API endpoints
        this.router.post('/register', this.controller.register);
        this.router.post('/login', this.controller.login);
        this.router.get('/logout', this.controller.logout);
    }
    
    getRouter() {
        return this.router;
    }
}

module.exports = new UserRouter().getRouter();