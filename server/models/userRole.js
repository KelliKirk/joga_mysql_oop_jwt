const BaseSQLModel = require('./base');

class userRoleModel extends BaseSQLModel {
    constructor() {
        super('user_role');
    }
    
    async getUserRoles(userId) {
        const query = `
            SELECT r.id, r.name, r.description
            FROM role r
            INNER JOIN user_role ur ON r.id = ur.role_id
            WHERE ur.user_id = ?
        `;
        const results = await this.executeQuery(query, [userId]);
        return results;
    }
    
    async hasRole(userId, roleName) {
        const query = `
            SELECT COUNT(*) as count
            FROM user_role ur
            INNER JOIN role r ON ur.role_id = r.id
            WHERE ur.user_id = ? AND r.name = ?
        `;
        const results = await this.executeQuery(query, [userId, roleName]);
        return results[0].count > 0;
    }
    
    async addRole(userId, roleName) {
        const roleQuery = 'SELECT id FROM role WHERE name = ?';
        const roleResult = await this.executeQuery(roleQuery, [roleName]);
        
        if (!roleResult || roleResult.length === 0) {
            throw new Error(`Roll "${roleName}" ei leitud`);
        }
        
        const roleId = roleResult[0].id;
        
        const hasRoleAlready = await this.hasRole(userId, roleName);
        if (hasRoleAlready) {
            return;
        }
        
        const data = { user_id: userId, role_id: roleId };
        return await super.create(data);
    }
    
    async removeRole(userId, roleName) {
        const roleQuery = 'SELECT id FROM role WHERE name = ?';
        const roleResult = await this.executeQuery(roleQuery, [roleName]);
        
        if (!roleResult || roleResult.length === 0) {
            throw new Error(`Roll "${roleName}" ei leitud`);
        }
        
        const roleId = roleResult[0].id;
        
        const query = `DELETE FROM ${this.tableName} WHERE user_id = ? AND role_id = ?`;
        const result = await this.executeQuery(query, [userId, roleId]);
        return result.affectedRows;
    }
}

module.exports = new userRoleModel();