const mongoose = require ('mongoose');
var Schema = mongoose.Schema;

const ProductosSchema = Schema({
    nombre: String,
    cantidad: Number,
    precio: Number,
    idCategoria: {type: Schema.Types.ObjectId, ref: 'categorias'},
    cantidadVendida: Number
});

module.exports = mongoose.model('productos', ProductosSchema);