const express = require('express');
const categoriaControlador = require('../controllers/categoria.controller');
const md_autenticacion = require('../middlewares/autenticacion');

var api = express.Router();

api.post('/registrarCategoria', md_autenticacion.Auth, categoriaControlador.agregarCategoria);
api.get('/obtenerCategorias', categoriaControlador.visualizarCategorias);
api.put('/editarCategoria/:idCategoria', md_autenticacion.Auth, categoriaControlador.editarCategoria);
api.delete('/eliminarCategoria/:idCategoria', md_autenticacion.Auth, categoriaControlador.eliminarCategoria);


module.exports = api;