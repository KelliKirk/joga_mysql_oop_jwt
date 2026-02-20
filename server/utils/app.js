const express = require('express');
const path = require('path');
const hbs = require('express-handlebars');
const session = require('express-session');  
const articleRoutes = require('../routes/articles');
const authorRoutes = require('../routes/author');
const userRoutes = require('../routes/users');
const adminRoutes = require('../routes/admin');
const commentRoutes = require('../routes/comments');
const hbsHelpers = require('./handlebars-helpers'); 

class App {
    constructor(port) {
        this.port = port;
        this.app = express();
        this.bindMethods();
        this.initMiddleware();
        this.initViewEngine();  
        this.initRoutes();
        this.start();
    }
    
    bindMethods() {
        this.initMiddleware = this.initMiddleware.bind(this);
        this.initViewEngine = this.initViewEngine.bind(this);
        this.initRoutes = this.initRoutes.bind(this);
        this.start = this.start.bind(this);
    }
    
    initViewEngine() {
        this.app.set('views', path.join(__dirname, '/../views'));
        this.app.set('view engine', 'hbs');
        this.app.engine('hbs', hbs.engine({
            extname: 'hbs',
            defaultLayout: 'main',
            layoutsDir: path.join(__dirname, '/../views/layouts/'),
            helpers: hbsHelpers
        }));
        this.app.use(express.static('public'));
    }
    
    initMiddleware() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        
        // Session middleware
        this.app.use(session({
            secret: 'your-secret-key-here',  // Muuda see juhuslikuks stringiks
            resave: false,
            saveUninitialized: false,
            cookie: { 
                secure: false,  // true kui kasutad HTTPS-i
                maxAge: 1000 * 60 * 60 * 24  // 24 tundi
            }
        }));
    }
    
    initRoutes() {
        this.app.use('/', articleRoutes);
        this.app.use('/author', authorRoutes);
        this.app.use('/user', userRoutes); 
        this.app.use('/admin', adminRoutes);
        this.app.use('/', commentRoutes)
    }
    
    start() {
        this.app.listen(this.port, () => {
            console.log(`App listening on port ${this.port}`);
        });
    }
}

module.exports = App;