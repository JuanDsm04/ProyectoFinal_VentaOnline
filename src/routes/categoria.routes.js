const express = require('express');
const categoriaControlador = require('../controllers/categoria.controller');
const md_autenticacion = require('../middlewares/autenticacion');

var api = express.Router();

api.post('/registrarCategoria', md_autenticacion.Auth, categoriaControlador.agregarCategoria);
api.get('/obtenerCategoriasAdmin', md_autenticacion.Auth, categoriaControlador.visualizarCategorias);
api.put('/editarCategoria/:idCategoria', md_autenticacion.Auth, categoriaControlador.editarCategoria);
api.delete('/eliminarCategoria/:idCategoria', md_autenticacion.Auth, categoriaControlador.eliminarCategoria);
api.get('/mostrarCategorias/', md_autenticacion.Auth, categoriaControlador.mostrarCategorias);

module.exports = api;