const express = require('express');
const facturaControlador = require('../controllers/factura.controller');
const md_autenticacion = require('../middlewares/autenticacion');

var api = express.Router();

api.get('/mostrarFacturasUsuarios/:idUsuario', md_autenticacion.Auth, facturaControlador.mostrarFacturasUsuarios);
api.get('/mostrarProductosFactura/:idFactura', md_autenticacion.Auth, facturaControlador.mostrarProductoFactura);
api.get('/productosAgotados', md_autenticacion.Auth, facturaControlador.mostrarProductosAgotados);
api.get('/productosMasVendidos', md_autenticacion.Auth, facturaControlador.mostrarProductosMasVendidos);
api.get('/comprasRealizadas/:idUsuario', md_autenticacion.Auth, facturaControlador.mostrarComprasRealizadas);


//api.get('/crearPDF/:idFactura', md_autenticacion.Auth, facturaControlador.crearPDF);

module.exports = api;