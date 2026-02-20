const userModel = require('../models/users');
const userRoleModel = require('../models/userRole');
const ArticleModel = require('../models/article');
const CommentModel = require('../models/comment');

class AdminController {
    constructor() {
        this.showAdminPanel = this.showAdminPanel.bind(this);
        this.getAllUsers = this.getAllUsers.bind(this);
        this.getStats = this.getStats.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
        this.updateUserRole = this.updateUserRole.bind(this);
    }

    showAdminPanel(req, res) {
        res.render('admin', {
            title: 'Admini paneel',
            user: req.session.user
        });
    }

    async getAllUsers(req, res) {
        try {
            const query = `
                SELECT 
                    u.id, 
                    u.username, 
                    u.email,
                    GROUP_CONCAT(r.name) as roles
                FROM user u
                LEFT JOIN user_role ur ON u.id = ur.user_id
                LEFT JOIN role r ON ur.role_id = r.id
                GROUP BY u.id, u.username, u.email
                ORDER BY u.id
            `;
            
            const users = await userModel.executeQuery(query);
            
            res.json({ users: users });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getStats(req, res) {
        try {
            const articles = await ArticleModel.findAll();
            
            const commentsQuery = 'SELECT COUNT(*) as count FROM comment';
            const commentsResult = await CommentModel.executeQuery(commentsQuery);
            const commentsCount = commentsResult[0].count;
            
            res.json({
                articles: articles.length,
                comments: commentsCount
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async deleteUser(req, res) {
        try {
            const userId = req.params.id;
            
            if (parseInt(userId) === req.session.user.user_id) {
                return res.status(400).json({ 
                    error: 'Sa ei saa ennast kustutada' 
                });
            }
            
            const affectedRows = await userModel.delete(userId);
            
            if (affectedRows === 0) {
                return res.status(404).json({ error: 'Kasutajat ei leitud' });
            }
            
            res.json({ message: 'Kasutaja edukalt kustutatud' });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: error.message });
        }
    }

   async updateUserRole(req, res) {
    try {
        const userId = req.params.id;
        const { role } = req.body;
        
        if (parseInt(userId) === req.session.user.user_id) {
            return res.status(400).json({ 
                error: 'Sa ei saa enda rolli muuta' 
            });
        }
        
        if (role === 'admin') {
            await userRoleModel.addRole(userId, 'admin');
        } else {
            await userRoleModel.removeRole(userId, 'admin');
        }
        
        res.json({ message: 'Kasutaja roll edukalt uuendatud' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
}
}

module.exports = new AdminController();