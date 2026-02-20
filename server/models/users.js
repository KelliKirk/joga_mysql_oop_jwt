const BaseSQLModel = require('./base');
const UserRoleModel = require('./userRole');

class UserModel extends BaseSQLModel {
    constructor() {
        super('user');
    }
    
    async findByEmail(email) {
        const query = `SELECT * FROM ${this.tableName} WHERE email = ?`;
        const results = await this.executeQuery(query, [email]);
        return results[0];
    }
    
    async findByUsername(username) {
        const query = `SELECT * FROM ${this.tableName} WHERE username = ?`;
        const results = await this.executeQuery(query, [username]);
        return results[0];
    }
    
    async findByIdWithRoles(id) {
        const user = await this.findById(id);
        if (user) {
            user.roles = await UserRoleModel.getUserRoles(id);
        }
        return user;
    }
    
    async create(user) {
        const createdUserId = await super.create(user);
        return createdUserId;
    }
    
    async update(id, data) {
        const affectedRows = await super.update(id, data);
        return affectedRows;
    }
}

module.exports = new UserModel();