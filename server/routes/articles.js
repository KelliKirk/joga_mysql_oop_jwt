const express = require('express');
const ArticleController = require('../controllers/articles');
const AuthMiddleware = require('../middleware/auth');

class ArticleRouter {
    constructor() {
        this.router = express.Router();
        this.controller = ArticleController;
        this.initRoutes();
    }
    
    initRoutes() {
    // Avalikud route'id
    this.router.get('/', this.controller.getAllArticles);
    
    
    // Sisselogitud kasutajad saavad artikleid luua
    this.router.get('/article/create', 
        AuthMiddleware.isAuthenticated,
        this.controller.showCreateForm
    );
    
    this.router.post('/article/create', 
        AuthMiddleware.isAuthenticated,
        this.controller.createArticle
    );
    
    // Artikli muutmise vormi näitamine - ainult autentimine, õigusi kontrollib kontroller
    this.router.get('/article/edit/:id', 
        AuthMiddleware.isAuthenticated,
        this.controller.showEditForm
    );
    
    // Artikli muutmise salvestamine - POST (vormist)
    this.router.post('/article/edit/:id', 
        AuthMiddleware.isAuthenticated,
        this.controller.updateArticle
    );
    
    // Artikli muutmine - PUT (API)
    this.router.put('/article/edit/:id', 
        AuthMiddleware.isArticleOwnerOrAdmin,
        this.controller.updateArticle
    );
    
    // Artikli kustutamine
    this.router.delete('/article/delete/:id', 
        AuthMiddleware.isAuthenticated,
        this.controller.deleteArticle
    );
    
    this.router.get('/article/:slug', this.controller.getArticleBySlug);
}

    getRouter() {
        return this.router;
    }
}

module.exports = new ArticleRouter().getRouter();