const express = require('express');
const usuarioControlador = require('../controllers/usuario.controller');
const md_autenticacion = require('../middlewares/autenticacion');

var api = express.Router();

api.post('/login', usuarioControlador.Login);
api.post('/registrarUsuario', usuarioControlador.registrarUsuario);
api.put('/editarRolUsuario/:idUsuario', md_autenticacion.Auth, usuarioControlador.editarRolUsuario);
api.put('/editarUsuario/:idUsuario', md_autenticacion.Auth, usuarioControlador.editarUsuario);
api.delete('/eliminarUsuario/:idUsuario', md_autenticacion.Auth, usuarioControlador.eliminarUsuario);

api.put('/agregarProductoCarrito', md_autenticacion.Auth, usuarioControlador.agregarProductoCarrito);
api.delete('/eliminarProductoCarrito', md_autenticacion.Auth, usuarioControlador.eliminarProductoCarrito)
api.put('/crearFactura', md_autenticacion.Auth, usuarioControlador.carritoAFactura);


module.exports = api;