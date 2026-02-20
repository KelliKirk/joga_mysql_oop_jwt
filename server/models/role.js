const BaseSQLModel = require('./base');

class RoleModel extends BaseSQLModel {
    constructor() {
        super('role');
    }
    
    async findByName(name) {
        const query = `SELECT * FROM ${this.tableName} WHERE name = ?`;
        const results = await this.executeQuery(query, [name]);
        return results[0];
    }
    
    async getRolesByUserId(userId) {
        const query = `
            SELECT r.* 
            FROM role r
            INNER JOIN user_role ur ON r.id = ur.role_id
            WHERE ur.user_id = ?
        `;
        const results = await this.executeQuery(query, [userId]);
        return results;
    }
}

module.exports = new RoleModel();