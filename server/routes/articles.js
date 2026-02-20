const express = require('express');
const ArticleController = require('../controllers/articles');
const AuthMiddleware = require('../utils/auth');  

class ArticleRouter {
    constructor() {
        this.router = express.Router();
        this.controller = ArticleController;
        this.initRoutes();
    }
    
    initRoutes() {
        // Avalikud route'id
        this.router.get('/', this.controller.getAllArticles);
        this.router.get('/article/:slug', this.controller.getArticleBySlug);
        
        // Sisselogitud kasutajad saavad artikleid luua (ainult API)
        this.router.post('/article/create', 
            AuthMiddleware.isAuthenticated,
            this.controller.createArticle
        );
        
        // Artikli muutmine
        this.router.put('/article/edit/:id', 
            AuthMiddleware.isAuthenticated,
            this.controller.updateArticle
        );
        
        // Artikli kustutamine
        this.router.delete('/article/delete/:id', 
            AuthMiddleware.isAuthenticated,
            this.controller.deleteArticle
        );
    }
    
    getRouter() {
        return this.router;
    }
}

module.exports = new ArticleRouter().getRouter();