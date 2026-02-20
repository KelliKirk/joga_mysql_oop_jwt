const express = require('express');
const CommentController = require('../controllers/comments');
const AuthMiddleware = require('../utils/auth');  

class CommentRouter {
    constructor() {
        this.router = express.Router();
        this.controller = CommentController;
        this.initRoutes();
    }
    
    initRoutes() {
        // Avalik - kõik saavad kommentaare lugeda
        this.router.get('/article/:articleId/comments', 
            this.controller.getCommentsByArticle
        );
        
        // Sisselogitud kasutajad saavad kommenteerida
        this.router.post('/comment/create', 
            AuthMiddleware.isAuthenticated,
            this.controller.createComment
        );
        
        // Ainult admin saab kommentaare muuta
        this.router.put('/comment/edit/:id', 
            AuthMiddleware.isAuthenticated,  
            AuthMiddleware.isAdmin,
            this.controller.updateComment
        );
        
        // Ainult admin saab kommentaare kustutada
        this.router.delete('/comment/delete/:id', 
            AuthMiddleware.isAuthenticated,  
            AuthMiddleware.isAdmin,
            this.controller.deleteComment
        );
    }
    
    getRouter() {
        return this.router;
    }
}

module.exports = new CommentRouter().getRouter();