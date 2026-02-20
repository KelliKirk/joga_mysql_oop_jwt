const express = require('express');
const AuthorController = require('../controllers/author');

class AuthorRouter {
    constructor() {
        this.router = express.Router();
        this.controller = AuthorController;
        this.initRoutes();
    }
    
    initRoutes() {
        this.router.get('/:id', this.controller.getAuthorById); 
    }
    
    getRouter() {
        return this.router;
    }
}

module.exports = new AuthorRouter().getRouter();