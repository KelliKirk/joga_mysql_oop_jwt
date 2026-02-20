const BaseSQLModel = require('./base');

class AuthorModel extends BaseSQLModel {
    constructor() {
        super('author');
    }
    
    async findById(id) {
        const query = `SELECT * FROM ${this.tableName} WHERE id = ?`;
        const results = await this.executeQuery(query, [id]);
        return results[0];
    }

   
}

module.exports = new AuthorModel();