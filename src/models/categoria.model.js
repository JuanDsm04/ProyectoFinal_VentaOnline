const mongoose = require ('mongoose');
var Schema = mongoose.Schema;

const CategoriasSchema = Schema({
    nombre: String
});

module.exports = mongoose.model('categorias', CategoriasSchema);