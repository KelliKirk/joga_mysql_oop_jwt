const express = require('express');
const userController = require('../controllers/user');

class UserRouter {
    constructor() {
        this.router = express.Router();
        this.controller = userController;
        this.initRoutes();
    }
    
    initRoutes() {
        // API endpoints 
        this.router.post('/register', this.controller.register);
        this.router.post('/login', this.controller.login);
    }
    
    getRouter() {
        return this.router;
    }
}

module.exports = new UserRouter().getRouter();