const mongoose = require ('mongoose');
var Schema = mongoose.Schema;

const FacturasSchema = Schema({
    nit: String,
    idUsuario: {type: Schema.Types.ObjectId, ref: 'usuarios'},
    listaProductos: [{
        nombreProducto: String,
        cantidadComprada: Number,
        precioUnitario: Number,
        subtotal: Number
    }],
    totalFactura: Number
});

module.exports = mongoose.model('facturas', FacturasSchema);