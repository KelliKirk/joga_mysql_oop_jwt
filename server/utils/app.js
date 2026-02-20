const express = require('express');
const path = require('path');
const articleRoutes = require('../routes/articles');
const authorRoutes = require('../routes/author');
const userRoutes = require('../routes/users');
const adminRoutes = require('../routes/admin');
const commentRoutes = require('../routes/comments');

class App {
    constructor(port) {
        this.port = port;
        this.app = express();
        this.bindMethods();
        this.initMiddleware();
        this.initRoutes();
        this.start();
    }
    
    bindMethods() {
        this.initMiddleware = this.initMiddleware.bind(this);
        this.initRoutes = this.initRoutes.bind(this);
        this.start = this.start.bind(this);
    }
    
    initMiddleware() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.static('public'));
    }
    
    initRoutes() {
        this.app.use('/', articleRoutes);
        this.app.use('/author', authorRoutes);
        this.app.use('/user', userRoutes); 
        this.app.use('/admin', adminRoutes);
        this.app.use('/', commentRoutes);
    }
    
    start() {
        this.app.listen(this.port, () => {
            console.log(`App listening on port ${this.port}`);
        });
    }
}

module.exports = App;