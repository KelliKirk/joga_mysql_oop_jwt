const { verifyToken } = require('./jwt');
const UserRoleModel = require('../models/userRole');

class AuthMiddleware {
    // Kontrolli, kas kasutaja on sisse logitud (JWT token)
    static isAuthenticated(req, res, next) {
        try {
            // Võta token Authorization header'ist
            const authHeader = req.headers.authorization;
            
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ 
                    error: 'Token puudub. Palun logi sisse.' 
                });
            }
            
            // Eraldame "Bearer " eest tokeni
            const token = authHeader.substring(7);
            
            // Verifitseeri token
            const decoded = verifyToken(token);
            
            // Lisa dekodeeritud andmed req.user külge
            req.user = {
                user_id: decoded.user_id,
                username: decoded.username,
                email: decoded.email,
                is_admin: decoded.is_admin
            };
            
            console.log('Authenticated user:', req.user);
            
            return next();
            
        } catch (error) {
            console.error('Auth error:', error);
            
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    error: 'Token on aegunud. Palun logi uuesti sisse.' 
                });
            }
            
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ 
                    error: 'Vigane token. Palun logi uuesti sisse.' 
                });
            }
            
            return res.status(401).json({ 
                error: 'Autentimine ebaõnnestus.' 
            });
        }
    }
    
    // Kontrolli, kas kasutajal on vajalik roll
    static hasRole(roleName) {
        return async (req, res, next) => {
            // Eeldame, et isAuthenticated on juba käivitatud
            if (!req.user) {
                return res.status(401).json({ 
                    error: 'Autentimine nõutud' 
                });
            }
            
            try {
                const hasRole = await UserRoleModel.hasRole(
                    req.user.user_id, 
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
    
    // Kontrolli, kas kasutaja on admin
    static isAdmin(req, res, next) {
        // Eeldame, et isAuthenticated on juba käivitatud
        if (!req.user) {
            return res.status(401).json({ 
                error: 'Autentimine nõutud' 
            });
        }
        
        // Kontrollime is_admin flag'i, mis on token'is
        if (req.user.is_admin) {
            return next();
        }
        
        // Kui flag puudub, kontrollime andmebaasist
        return AuthMiddleware.hasRole('admin')(req, res, next);
    }
    
    // Kontrolli, kas kasutaja on artikli omanik või admin
    static async isArticleOwnerOrAdmin(req, res, next) {
        if (!req.user) {
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
            const isAdmin = req.user.is_admin || await UserRoleModel.hasRole(
                req.user.user_id, 
                'admin'
            );
            
            // Kontrolli, kas kasutaja on artikli autor
            const isOwner = article.author_id === req.user.user_id;
            
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