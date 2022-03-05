const Usuarios = require('../models/usuario.model');
const bcrypt = require('bcrypt-nodejs')
const jwt = require('../services/jwt');

/* ADMINISTRADOR DEFAULT */
function administradorDefault(){
    Usuarios.find({usuario:'ADMIN'}, (err, administradorEncontrado)=>{
        if(administradorEncontrado == 0){
            bcrypt.hash('123456', null, null, (err, passwordEncriptada)=>{
                Usuarios.create({
                    nombre: null,
                    usuario: 'ADMIN',
                    rol: 'ROL_ADMINISTRADOR',
                    password: passwordEncriptada
                })
            });
        }
    });
}


/* LOGIN */
function Login(req, res){
    var parametros = req.body;
    Usuarios.findOne({usuario: parametros.usuario}, (err, usuarioEncontrado) => {
        if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
        if(usuarioEncontrado){

            bcrypt.compare(parametros.password, usuarioEncontrado.password, 
                (err, verificacionPassword) => {
                    if (verificacionPassword){
                        if(parametros.obtenerToken === 'true'){
                            return res.status(200)
                            .send({token: jwt.crearToken(usuarioEncontrado)});
                        } else{
                            usuarioEncontrado.password = undefined;
                            return res.status(200)
                            .send({usuario: usuarioEncontrado});
                        }
                        
                    }else{
                        return res.status(500)
                        .send({mensaje: 'Las contrasenas no coincide'});
                    }
                })

        }else{
            return res.status(500).send({mensaje: 'Error el usuario no se encuentra registrado'});
        }
    })
}


/* AGREGAR UN NUEVO USUARIO (Registrarse)*/
function registrarUsuario (req, res){
    var parametros = req.body;
    var usuarioModel = new Usuarios();

    if (parametros._id != null)
    return res.status(500).send({ mensaje: 'No se puede elegir el id'});

    if (parametros.rol != null)
    return res.status(500).send({ mensaje: 'No puede elegir el rol, a menos que un Administrador lo edite despues'});
    
    if (parametros.carrito != null)
    return res.status(500).send({ mensaje: 'No puede manipular su carrito al momento de registrarse'});

    if (parametros.totalCarrito != null)
    return res.status(500).send({ mensaje: 'No puede manipular el total del carrito'});

    if(parametros.nombre && parametros.usuario && parametros.password){
        usuarioModel.nombre = parametros.nombre;
        usuarioModel.usuario = parametros.usuario;
        usuarioModel.rol = 'ROL_CLIENTE';
        usuarioModel.password = parametros.password;
        totalCarrito = 0;
        
        Usuarios.find({usuario: parametros.usuario}, (err, empresaEncontrada)=>{
            if (empresaEncontrada.length == 0){
                bcrypt.hash(parametros.password, null, null, (err, passwordEncriptada)=>{
                    usuarioModel.password = passwordEncriptada;

                    usuarioModel.save((err, empresaGuardada)=>{
                        if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                        if(!empresaGuardada) return res.status(500).send({mensaje: 'Error al agregar la Empresa'});
    
                        return res.status(200).send({empresa: empresaGuardada});
                    });
                })
            }else{
                return res.status(500).send({mensaje:'Este usuario de empresa ya existe'});
            }
        })
    }else{
        return res.status(500).send({mensaje: 'Debe rellenar los campos necesarios'});
    }

}


/* EDITAR EL ROL DEL USUARIO */
function editarRolUsuario (req, res){
    var idUsu = req.params.idUsuario;
    var parametros = req.body;

    if(parametros.rol != 'ROL_ADMINISTRADOR')
    return res.status(500).send ({mensaje: 'Este rol no existe'});

    if(req.user.rol != 'ROL_ADMINISTRADOR')
    return res.status(404).send ({mensaje: 'Solo el administrador puede modificar los roles'});

    //req.user.totalCarrito = 0;

    Usuarios.findOneAndUpdate({rol:'ROL_CLIENTE', _id: idUsu}, parametros, {new: true} ,(err, usuarioRolActualizado) => {
        if (err) return res.status(500).send({mensaje: 'Error en la peticion'});
        if(!usuarioRolActualizado) return res.status(404).send({mensaje: "Ocurrio un error o no tiene permitido modificar el rol de este usuario."});

        return res.status(200).send({usuario: usuarioRolActualizado});
    })
}


/* EDTIAR USUARIO */
function editarUsuario (req, res){
    var idUsu = req.params.idUsuario;
    var parametros = req.body;

    if (parametros._id != null)
    return res.status(500).send({ mensaje: 'No se puede editar el id'});
    
    if(parametros.rol != null)
    return res.status(500).send ({mensaje: 'El rol lo puede modificar desde la edicion de rol'});

    if(parametros.totalCarrito != null)
    return res.status(500).send ({mensaje: 'No puede modificar el total de su carrito'});

    if (parametros.password != null)
    return res.status(500).send({ mensaje: 'No tiene autorizado el editar la password'});

    if( req.user.rol == 'ROL_ADMINISTRADOR' ){

        Usuarios.find({usuario: parametros.usuario}, (err, usuarioEncontrado)=>{
            if (usuarioEncontrado.length == 0){
                Usuarios.findOneAndUpdate({rol:'ROL_CLIENTE', _id: idUsu}, parametros, {new: true} ,(err, usuarioRolActualizado) => {
                    if (err) return res.status(500).send({mensaje: 'Error en la peticion'});
                    if(!usuarioRolActualizado) return res.status(404).send({mensaje: "Ocurrio un error, posiblemente intento editar a un administrador"});
            
                    return res.status(200).send({usuario: usuarioRolActualizado});
                })
            }else{
                return res.status(500).send({mensaje:'Este usuario ya existe'});
            }
        })

    }else{
        if ( idUsu !== req.user.sub ) 
        return res.status(500).send({ mensaje: 'Usted es un cliente y por lo tanto no puede editar a otro cliente, o a un administrador.'});

        Usuarios.find({usuario: parametros.usuario}, (err, usuarioEncontrado)=>{
            if (usuarioEncontrado.length == 0){
                Usuarios.findOneAndUpdate({rol:'ROL_CLIENTE', _id: idUsu}, parametros, {new: true} ,(err, usuarioRolActualizado) => {
                    if (err) return res.status(500).send({mensaje: 'Error en la peticion'});
                    if(!usuarioRolActualizado) return res.status(404).send({mensaje: "Ocurrio un error, posiblemente intento editar a un administrador"});
            
                    return res.status(200).send({usuario: usuarioRolActualizado});
                })
            }else{
                return res.status(500).send({mensaje:'Este usuario ya existe'});
            }
        })
    }
    
}


/* ELIMINAR USUARIO */
function eliminarUsuario (req, res){
    var idUsu = req.params.idUsuario;

    if( req.user.rol == 'ROL_ADMINISTRADOR' ){
        Usuarios.findOneAndDelete({rol:'ROL_CLIENTE', _id: idUsu},(err, eliminarUsuario) => {
            if (err) return res.status(500).send({mensaje: 'Error en la peticion'});
            if(!eliminarUsuario) return res.status(404).send({mensaje: "Ocurrio un error o no tiene permitido eliminar a un Administrador."});
    
            return res.status(200).send({usuario: eliminarUsuario});
        })
    }else{
        if ( idUsu !== req.user.sub ) 
        return res.status(500).send({ mensaje: 'Usted es un cliente y por lo tanto no puede eliminar a otro cliente o a un administrador.'});

        Usuarios.findOneAndDelete({rol:'ROL_CLIENTE', _id: idUsu},(err, eliminarUsuario) => {
            if (err) return res.status(500).send({mensaje: 'Error en la peticion'});
            if(!eliminarUsuario) return res.status(404).send({mensaje: "Ocurrio un error o no tiene permitido eliminar a un Administrador."});

            return res.status(200).send({usuario: eliminarUsuario});
        })
    }
    
}


module.exports = {
    administradorDefault,
    Login,
    registrarUsuario,
    editarRolUsuario,
    editarUsuario,
    eliminarUsuario
}