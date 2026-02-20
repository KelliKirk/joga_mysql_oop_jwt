const UserRoleModel = require('../models/userRole');

class AuthMiddleware {
    // Kontrollib, kas kasutaja on sisse logitud
    static isAuthenticated(req, res, next) {
         console.log('=== AUTH MIDDLEWARE DEBUG ===');
         console.log('Session exists:', !!req.session);
         console.log('Session:', req.session);
         console.log('Session.user:', req.session.user);
         console.log('Cookie header:', req.headers.cookie);
         console.log('Session ID:', req.sessionID);
         console.log('============================');
        if (req.session && req.session.user) {
            return next();
        }
        return res.status(401).json({ 
            error: 'Autentimine nõutud. Palun logi sisse.' 
        });
    }
    
    // Kontrollib, kas kasutajal on vajalik roll
    static hasRole(roleName) {
        return async (req, res, next) => {
            if (!req.session || !req.session.user) {
                return res.status(401).json({ 
                    error: 'Autentimine nõutud' 
                });
            }
            
            try {
                const hasRole = await UserRoleModel.hasRole(
                    req.session.user.user_id, 
                    roleName
                );
                
                if (hasRole) {
                    return next();
                }
                
                return res.status(403).json({ 
                    error: 'Sul ei ole õigusi selle toimingu tegemiseks' 
                });
            } catch (error) {
                console.error('Role check error:', error);
                return res.status(500).json({ 
                    error: 'Õiguste kontrollimisel tekkis viga' 
                });
            }
        };
    }
    
    // Kontrollib, kas kasutaja on admin
    static isAdmin(req, res, next) {
        return AuthMiddleware.hasRole('admin')(req, res, next);
    }
    
    // Kontrollib, kas kasutaja on artikli omanik või admin
    static async isArticleOwnerOrAdmin(req, res, next) {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ 
                error: 'Autentimine nõutud' 
            });
        }
        
        try {
            const ArticleModel = require('../models/article');
            const articleId = req.params.id;
            const article = await ArticleModel.findById(articleId);
            
            if (!article) {
                return res.status(404).json({ 
                    error: 'Artiklit ei leitud' 
                });
            }
            
            // Kontrolli, kas kasutaja on admin
            const isAdmin = await UserRoleModel.hasRole(
                req.session.user.user_id, 
                'admin'
            );
            
            // Kontrolli, kas kasutaja on artikli autor
            const isOwner = article.author_id === req.session.user.user_id;
            
            if (isAdmin || isOwner) {
                return next();
            }
            
            return res.status(403).json({ 
                error: 'Sul ei ole õigusi selle artikli muutmiseks' 
            });
        } catch (error) {
            console.error('Authorization error:', error);
            return res.status(500).json({ 
                error: 'Autoriseerimise kontrollimisel tekkis viga' 
            });
        }
    }
}

module.exports = AuthMiddleware;