const BaseSQLModel = require('./base');

class ArticleModel extends BaseSQLModel {
    constructor() {
        super('article');
    }
    
    async findBySlug(slug) {
        const query = `SELECT * FROM ${this.tableName} WHERE slug = ?`;
        const results = await this.executeQuery(query, [slug]);
        return results[0];
    }

    async findMany(where, value) {
        return await super.findMany(where, value);
    }  

    async create(article) {
        const createdArticleId = await super.create(article)
        return createdArticleId
    } 

    async update(id, data){
        const affectedRows = await super.update(id, data);
        return affectedRows;
    } 
}

module.exports = new ArticleModel();