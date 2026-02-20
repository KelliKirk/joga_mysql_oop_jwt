const AuthorModel = require('../models/author');
const ArticleModel = require('../models/article'); 

class AuthorController {
    constructor() {
        this.authorModel = AuthorModel;
        this.articleModel = ArticleModel;
        this.getAuthorById = this.getAuthorById.bind(this);
    }
    
    async getAuthorById(req, res) {
        try {
            const author = await this.authorModel.findById(req.params.id);
            
            if (!author) {
                return res.status(404).json({ error: 'Author not found' });
            }
            
            // Leia kõik artiklid selle autori kohta
            const articles = await this.articleModel.findMany('author_id', author.id);
            author.articles = articles;
            
            res.status(200).json({ author: author });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new AuthorController();