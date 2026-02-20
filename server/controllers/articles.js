const ArticleModel = require('../models/article');

class ArticleController {
    constructor() {
        this.model = ArticleModel;
        this.getAllArticles = this.getAllArticles.bind(this);
        this.getArticleBySlug = this.getArticleBySlug.bind(this);
        this.createArticle = this.createArticle.bind(this);
        this.updateArticle = this.updateArticle.bind(this);
        this.deleteArticle = this.deleteArticle.bind(this);
        this.showCreateForm = this.showCreateForm.bind(this);
        this.showEditForm = this.showEditForm.bind(this);
    }
    
    async getAllArticles(req, res) {
        try {
            const articles = await this.model.findAll();

            // Authentication debug
            console.log('User session:', req.session.user);
            console.log('Is admin?', req.session.user?.is_admin);
            console.log('Articles:', articles.map(a => ({id: a.id, name: a.name, author_id: a.author_id})));
            
            res.render('index', { 
                articles: articles,
                user: req.session.user
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    
    async getArticleBySlug(req, res) {
        try {
            const slug = req.params.slug;
            const article = await this.model.findBySlug(slug);
            
            if (!article) {
                return res.status(404).send('Artiklit ei leitud');
            }
            
            res.render('article', { 
                article: article,
                user: req.session.user
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    
    // Näita artikli loomise vormi
    showCreateForm(req, res) {
        res.render('create-article', {  
            title: 'Loo uus artikkel',
            user: req.session.user,
            error: null
        });
    }
    
 async createArticle(req, res) {
    console.log('=== CREATE ARTICLE CALLED ===');
    console.log('Session user:', req.session.user);
    console.log('Request body:', req.body);
    
    try {
        if (!req.session.user) {
            console.log('User not logged in!');
            return res.render('create-article', {
                title: 'Loo uus artikkel',
                user: req.session.user,
                error: 'Pead olema sisse logitud'
            });
        }
        
        const articleData = {
            name: req.body.name,
            slug: req.body.slug,
            image: req.body.image || '',
            body: req.body.body,
            author_id: req.session.user.user_id,
            published: new Date()
        };
        
        console.log('Article data to create:', articleData);
        
        const newArticleId = await this.model.create(articleData);
        console.log('Created article ID:', newArticleId);
        
        if (!newArticleId) {
            console.log('Failed to create article!');
            return res.render('create-article', {
                title: 'Loo uus artikkel',
                user: req.session.user,
                error: 'Artikli loomine ebaõnnestus'
            });
        }
        
        console.log('Redirecting to home page');
        res.redirect('/');
        
    } catch (error) {
        console.error('Create article error:', error);
        res.render('create-article', {
            title: 'Loo uus artikkel',
            user: req.session.user,
            error: error.message
        });
    }
}
    
    async showEditForm(req, res) {
        try {
            const articleId = req.params.id;
            const article = await this.model.findById(articleId);
            
            if (!article) {
                return res.status(404).send('Artiklit ei leitud');
            }
            
            // Kontrolli õigusi
            const isAuthor = req.session.user.user_id === article.author_id;
            const isAdmin = req.session.user.is_admin;
            
            if (!isAuthor && !isAdmin) {
                return res.status(403).send('Sul ei ole õigusi selle artikli muutmiseks');
            }
            
            res.render('edit-article', {
                title: 'Muuda artiklit',
                article: article,
                user: req.session.user,
                error: null
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).send('Viga artikli laadimisel');
        }
    }
    
    async updateArticle(req, res) {
        try {
            const articleId = req.params.id;
            
            // Kontrolli omandiõigust
            const article = await this.model.findById(articleId);
            if (!article) {
                return res.status(404).json({ error: 'Artiklit ei leitud' });
            }
            
            const isAuthor = req.session.user.user_id === article.author_id;
            const isAdmin = req.session.user.is_admin;
            
            if (!isAuthor && !isAdmin) {
                return res.status(403).json({ error: 'Sul ei ole õigusi' });
            }
            
            const articleData = {
                name: req.body.name,
                slug: req.body.slug,
                image: req.body.image,
                body: req.body.body,
                author_id: article.author_id
            };
            
            const affectedRows = await this.model.update(articleId, articleData);
            
            if (affectedRows === 0) {
                return res.status(404).json({ error: 'Artikli uuendamine ebaõnnestus' });
            }
            
            // Kui päring tuli vormist, suuna tagasi artiklile
            if (req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded')) {
                const updatedArticle = await this.model.findById(articleId);
                return res.redirect(`/article/${updatedArticle.slug}`);
            }
            
            res.status(200).json({ 
                message: 'Artikkel edukalt uuendatud',
                id: articleId 
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    
    async deleteArticle(req, res) {
        try {
            const articleId = req.params.id;
            
            // Kontrolli omandiõigust
            const article = await this.model.findById(articleId);
            if (!article) {
                return res.status(404).json({ error: 'Artiklit ei leitud' });
            }
            
            const isAuthor = req.session.user.user_id === article.author_id;
            const isAdmin = req.session.user.is_admin;
            
            if (!isAuthor && !isAdmin) {
                return res.status(403).json({ error: 'Sul ei ole õigusi' });
            }
            
            const affectedRows = await this.model.delete(articleId);
            
            if (affectedRows === 0) {
                return res.status(404).json({ error: 'Artiklit ei leitud' });
            }
            
            res.status(200).json({ 
                message: 'Artikkel edukalt kustutatud',
                id: articleId 
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new ArticleController();