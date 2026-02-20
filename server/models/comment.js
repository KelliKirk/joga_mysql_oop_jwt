const BaseSQLModel = require('./base');

class CommentModel extends BaseSQLModel {
    constructor() {
        super('comment');
    }
    
    async findByArticleId(articleId) {
        const query = `
            SELECT c.*, u.username 
            FROM ${this.tableName} c
            INNER JOIN user u ON c.user_id = u.id
            WHERE c.article_id = ?
            ORDER BY c.created_at DESC
        `;
        const results = await this.executeQuery(query, [articleId]);
        return results;
    }
    
    async findReplies(parentId) {
        const query = `
            SELECT c.*, u.username 
            FROM ${this.tableName} c
            INNER JOIN user u ON c.user_id = u.id
            WHERE c.parent_id = ?
            ORDER BY c.created_at ASC
        `;
        const results = await this.executeQuery(query, [parentId]);
        return results;
    }
    
    async createComment(data) {
        return await super.create(data);
    }
    
    async updateComment(id, body) {
        const data = { body };
        return await super.update(id, data);
    }
    
    async deleteComment(id) {
        return await super.delete(id);
    }
}

module.exports = new CommentModel();