const Usuarios = require('../models/usuario.model');
const bcrypt = require('bcrypt-nodejs')
const jwt = require('../services/jwt');


/* ADMINISTRADOR DEFAULT */
function administradorDefault(){
    Usuarios.find({usuario:'Admin'}, (err, administradorEncontrado)=>{
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


module.exports = {
    administradorDefault,
    Login
}