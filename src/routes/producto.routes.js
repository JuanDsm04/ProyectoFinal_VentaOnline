const express = require('express');
const productoControlador = require('../controllers/producto.controller');
const md_autenticacion = require('../middlewares/autenticacion');

var api = express.Router();

api.post('/registrarProducto', md_autenticacion.Auth, productoControlador.agregarProducto);
api.get('/obtenerProductoPorId/:idProducto', md_autenticacion.Auth, productoControlador.obtenerProductoId);
api.get('/obtenerProductos', md_autenticacion.Auth, productoControlador.visualizarProductos);
api.put('/editarProducto/:idProducto', md_autenticacion.Auth, productoControlador.editarProducto);
api.put('/stockProducto/:idProducto', md_autenticacion.Auth , productoControlador.stockProducto);

api.get('/buscarProducto/:nombreProducto', md_autenticacion.Auth, productoControlador.buscarProductoNombre);
api.get('/buscarProductoCategoria/:nombreCategoria', md_autenticacion.Auth, productoControlador.mostrarProductoPorCategoria);
api.get('/catalogoMasVendidos', md_autenticacion.Auth, productoControlador.productosMasVendidos);

module.exports = api;