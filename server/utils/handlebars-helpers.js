// Handlebars helper funktsioonid
module.exports = {
    eq: function(a, b) {
        return a === b;
    },
    or: function(a, b) {
        return a || b;
    },
    and: function(a, b) {
        return a && b;
    },
    not: function(a) {
        return !a;
    }
};