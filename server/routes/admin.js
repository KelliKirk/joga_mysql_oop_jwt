const express = require('express');
const AdminController = require('../controllers/admin');
const AuthMiddleware = require('../utils/auth');  

class AdminRouter {
    constructor() {
        this.router = express.Router();
        this.controller = AdminController;
        this.initRoutes();
    }
    
    initRoutes() {
        // Kõik admin route'id nõuavad admin õigusi
        this.router.get('/', 
            AuthMiddleware.isAuthenticated,  
            AuthMiddleware.isAdmin,
            this.controller.showAdminPanel
        );
        
        this.router.get('/users', 
            AuthMiddleware.isAuthenticated,  
            AuthMiddleware.isAdmin,
            this.controller.getAllUsers
        );
        
        this.router.get('/stats', 
            AuthMiddleware.isAuthenticated,  
            AuthMiddleware.isAdmin,
            this.controller.getStats
        );
        
        this.router.delete('/user/:id', 
            AuthMiddleware.isAuthenticated,  
            AuthMiddleware.isAdmin,
            this.controller.deleteUser
        );
        
        this.router.post('/user/:id/role', 
            AuthMiddleware.isAuthenticated,  
            AuthMiddleware.isAdmin,
            this.controller.updateUserRole
        );
    }
    
    getRouter() {
        return this.router;
    }
}

module.exports = new AdminRouter().getRouter();