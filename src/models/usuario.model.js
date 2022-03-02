const mongoose = require ('mongoose');
var Schema = mongoose.Schema;

const UsuariosSchema = Schema({
    nombre: String,
    usuario: String,
    rol: String,
    password: String,
    carrito: [{
        nombreProducto: String,
        cantidadComprada: Number,
        precioUnitario: Number,
        subtotal: Number
    }],
    totalCarrito: Number
});

module.exports = mongoose.model('usuarios', UsuariosSchema);