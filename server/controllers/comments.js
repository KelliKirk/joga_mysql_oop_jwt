const CommentModel = require('../models/comment');

class CommentController {
    constructor() {
        this.model = CommentModel;
        this.getCommentsByArticle = this.getCommentsByArticle.bind(this);
        this.createComment = this.createComment.bind(this);
        this.updateComment = this.updateComment.bind(this);
        this.deleteComment = this.deleteComment.bind(this);
    }
    
    async getCommentsByArticle(req, res) {
        try {
            const articleId = req.params.articleId;
            const comments = await this.model.findByArticleId(articleId);
            
            res.status(200).json({ 
                comments: comments 
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    
    async createComment(req, res) {
        try {
            // Kontrolli, kas kasutaja on sisse logitud
            if (!req.session.user) {
                return res.status(401).json({ 
                    error: 'Pead olema sisse logitud, et kommenteerida' 
                });
            }
            
            const { article_id, body, parent_id } = req.body;
            
            if (!article_id || !body) {
                return res.status(400).json({ 
                    error: 'Artikli ID ja kommentaari sisu on kohustuslikud' 
                });
            }
            
            const commentData = {
                article_id: article_id,
                user_id: req.session.user.user_id,
                body: body,
                parent_id: parent_id || null
            };
            
            const newCommentId = await this.model.createComment(commentData);
            
            if (!newCommentId) {
                return res.status(500).json({ 
                    error: 'Kommentaari loomine ebaõnnestus' 
                });
            }
            
            res.status(201).json({ 
                message: 'Kommentaar edukalt loodud',
                id: newCommentId 
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    
    async updateComment(req, res) {
        try {
            const commentId = req.params.id;
            const { body } = req.body;
            
            if (!body) {
                return res.status(400).json({ 
                    error: 'Kommentaari sisu on kohustuslik' 
                });
            }
            
            const affectedRows = await this.model.updateComment(commentId, body);
            
            if (affectedRows === 0) {
                return res.status(404).json({ 
                    error: 'Kommentaari ei leitud' 
                });
            }
            
            res.status(200).json({ 
                message: 'Kommentaar edukalt uuendatud',
                id: commentId 
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    
    async deleteComment(req, res) {
        try {
            const commentId = req.params.id;
            
            const affectedRows = await this.model.deleteComment(commentId);
            
            if (affectedRows === 0) {
                return res.status(404).json({ 
                    error: 'Kommentaari ei leitud' 
                });
            }
            
            res.status(200).json({ 
                message: 'Kommentaar edukalt kustutatud',
                id: commentId 
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new CommentController();