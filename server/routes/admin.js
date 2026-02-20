const express = require('express');
const AdminController = require('../controllers/admin');
const AuthMiddleware = require('../middleware/auth');

class AdminRouter {
    constructor() {
        this.router = express.Router();
        this.controller = AdminController;
        this.initRoutes();
    }
    
    initRoutes() {
        // Kõik admin route'id nõuavad admin õigusi
        this.router.get('/', 
            AuthMiddleware.isAdmin,
            this.controller.showAdminPanel
        );
        
        this.router.get('/users', 
            AuthMiddleware.isAdmin,
            this.controller.getAllUsers
        );
        
        this.router.get('/stats', 
            AuthMiddleware.isAdmin,
            this.controller.getStats
        );
        
        this.router.delete('/user/:id', 
            AuthMiddleware.isAdmin,
            this.controller.deleteUser
        );
        
        this.router.post('/user/:id/role', 
            AuthMiddleware.isAdmin,
            this.controller.updateUserRole
        );
    }
    
    getRouter() {
        return this.router;
    }
}

module.exports = new AdminRouter().getRouter();