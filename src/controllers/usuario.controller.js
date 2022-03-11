const Usuarios = require('../models/usuario.model');
const Producto = require('../models/producto.model');
const Factura = require('../models/factura.model');
const facturaControlador = require('../controllers/factura.controller');

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


/* AGREGAR UN NUEVO USUARIO (ADMNISTRADORES Y USUARIOS)*/
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
                return res.status(500).send({mensaje:'Este usuario ya existe'});
            }
        })
    }else{
        return res.status(500).send({mensaje: 'Debe rellenar los campos necesarios'});
    }

}


/* EDITAR EL ROL DEL USUARIO (SOLO ADMINISTRADORES)*/
function editarRolUsuario (req, res){
    var idUsu = req.params.idUsuario;
    var parametros = req.body;

    if(parametros.rol != 'ROL_ADMINISTRADOR')
    return res.status(500).send ({mensaje: 'Este rol no existe'});

    if(req.user.rol != 'ROL_ADMINISTRADOR')
    return res.status(404).send ({mensaje: 'Solo el administrador puede modificar los roles de los usuarios'});

    Usuarios.findOneAndUpdate({rol:'ROL_CLIENTE', _id: idUsu}, {rol: parametros.rol, $set:{carrito: []}, totalCarrito: 0}, {new: true} ,(err, usuarioRolActualizado) => {
        if (err) return res.status(500).send({mensaje: 'Error en la peticion'});
        if(!usuarioRolActualizado) return res.status(404).send({mensaje: "Ocurrio un error o no tiene permitido modificar el rol de este usuario."});

        return res.status(200).send({usuario: usuarioRolActualizado});
    })
}


/* EDTIAR USUARIO (ADMINISTRADORES Y USUARIOS)*/
function editarUsuario (req, res){
    var idUsu = req.params.idUsuario;
    var parametros = req.body;

    if (parametros._id != null)
    return res.status(500).send({ mensaje: 'No se puede editar el id'});
    
    if(parametros.rol != null)
    return res.status(500).send ({mensaje: 'El rol puede ser modificado por un administrador'});

    if(parametros.totalCarrito != null)
    return res.status(500).send ({mensaje: 'No puede modificar el total de su carrito'});

    if(parametros.carrito != null)
    return res.status(500).send ({mensaje: 'Si lo que desea es editar su carrito, lo puede hacer desde el apartado correspondiente'});

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
        return res.status(500).send({ mensaje: 'Usted es un cliente y por lo tanto solo puede editar su perfil'});

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


/* ELIMINAR USUARIO (ADMINISTRADORES Y USUARIOS)*/
function eliminarUsuario (req, res){
    var idUsu = req.params.idUsuario;

    if( req.user.rol == 'ROL_ADMINISTRADOR' ){
        Usuarios.findOneAndDelete({rol:'ROL_CLIENTE', _id: idUsu},(err, eliminarUsuario) => {
            if (err) return res.status(500).send({mensaje: 'Error en la peticion'});
            if(!eliminarUsuario) return res.status(404).send({mensaje: "Ocurrio un error o no tiene permitido eliminar a un Administrador"});
    
            return res.status(200).send({usuario: eliminarUsuario});
        })
    }else{
        if ( idUsu !== req.user.sub ) 
        return res.status(500).send({ mensaje: 'Usted es un cliente y por lo tanto solo puede eliminar su cuenta'});

        Usuarios.findOneAndDelete({rol:'ROL_CLIENTE', _id: idUsu},(err, eliminarUsuario) => {
            if (err) return res.status(500).send({mensaje: 'Error en la peticion'});
            if(!eliminarUsuario) return res.status(404).send({mensaje: "Ocurrio un error o no tiene permitido eliminar a un Administrador"});

            return res.status(200).send({usuario: eliminarUsuario});
        })
    }
    
}


/* AGREGAR PRODUCTO A CARRITO (SOLO CLIENTES)*/
function agregarProductoCarrito(req, res){

    if(req.user.rol != 'ROL_CLIENTE')
    return res.status(404).send({mensaje: 'Solo los clientes pueden agregar productos a su carrito'});

    const usuarioLogueado = req.user.sub;
    const parametros = req.body;

    if(parametros.cantidad < 0)
    return res.status(500).send({mensaje: 'Si desea quitar algun producto de su carrito lo puede hacer desde el apartado correspondiente'})

    //Buscar el producto que se desea agregar al carrito
    Producto.findOne({nombre: parametros.nombreProducto}, (err, productoEncontrado)=>{
        if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
        if(!productoEncontrado) return res.status(404).send({mensaje: 'Error al obtener el producto, asegurese de que exista'});


        //Buscar si el producto que se esta agregando ya se encuentra en el carrito
        Usuarios.find({_id: usuarioLogueado, carrito:{$elemMatch : {nombreProducto:parametros.nombreProducto}}}, (err, usuarioEncontrado)=>{

            //Si aun no se encuentra dentro del carrito
            if (usuarioEncontrado.length == 0){

                //Evitar que agregue a su carrito mas producto del que se encuentra en stock.
                if(productoEncontrado.cantidad < parametros.cantidad)
                return res.status(500).send({mensaje:'No puede agregar esa cantidad a su carrito. La cantidad actual en el stock del producto es de: '+productoEncontrado.cantidad})


                let subtotal = parametros.cantidad * productoEncontrado.precio;

                Usuarios.findByIdAndUpdate(usuarioLogueado, {$push: {carrito: {nombreProducto:parametros.nombreProducto,
                    cantidadComprada: parametros.cantidad, precioUnitario: productoEncontrado.precio, subtotal: subtotal}}}, {new: true},
                    (err, usuarioActualizado)=>{
                        if(err) return res.status(500).send({mensaje: 'Error en la peticion de Usuario'});
                        if(!usuarioActualizado) return res.status(500).send({mensaje: 'Error al agregar el producto al carrito'});

                        let totalCarritoLocal = 0;

                        for (let i=0; i < usuarioActualizado.carrito.length; i++){
                            totalCarritoLocal = totalCarritoLocal + usuarioActualizado.carrito[i].subtotal;
                        }

                        Usuarios.findByIdAndUpdate(usuarioLogueado, {totalCarrito: totalCarritoLocal}, {new:true},
                            (err, totalActualizado)=>{
                                if(err) return res.status(500).send({mensaje: 'Error en la peticion de Total Carrito'});
                                if(!totalActualizado) res.status(500).send({mensaje: 'Error al modificar el total del carrito'});


                                Usuarios.find({_id: usuarioLogueado},{"_id":0,"nombre":0, "usuario":0, "rol":0, "password":0}, (err, usuarioEncontrado)=>{
                                    if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                                    if(!usuarioEncontrado) return res.status(404).send({mensaje: 'No se pudo encontrar el usuario'});

                                    return res.status(200).send({cliente: usuarioEncontrado})

                                })
                            })
                    })

            //Si se encontro el producto dentro del carrito
            }else{
                
                Usuarios.findOne({_id: usuarioLogueado, carrito:{$elemMatch : {nombreProducto:parametros.nombreProducto}}}, (err, carritoEncontrado)=>{
                    
                    let cantidadDeseada = 0;
                    let cantidadAgregadaAnteriormente = 0;


                    for(let i = 0; i < carritoEncontrado.carrito.length; i++){

                        if(carritoEncontrado.carrito[i].nombreProducto == parametros.nombreProducto){
                            cantidadDeseada = parseInt(carritoEncontrado.carrito[i].cantidadComprada) + parseInt(parametros.cantidad);
                            cantidadAgregadaAnteriormente = carritoEncontrado.carrito[i].cantidadComprada;
                        }
                    }


                    //Evitar que agregue a su carrito mas producto del que se encuentra en stock.
                    if(productoEncontrado.cantidad < cantidadDeseada)
                    return res.status(500).send({mensaje:'No puede agregar esa cantidad. La cantidad actual en el stock del producto es de: '+
                    productoEncontrado.cantidad+". Y usted ya va agregando "+cantidadAgregadaAnteriormente+" a su carrito."})

                    
                    Usuarios.findOneAndUpdate({carrito:{$elemMatch : {nombreProducto: parametros.nombreProducto}}}, 
                        { $inc :{ "carrito.$.cantidadComprada": parametros.cantidad }}, {new: true}, (err, carritoEditado)=>{
    
                        if(err) return res.status(500).send({mensaje: "Error en la peticion"});
                        if(!carritoEditado) return res.status(500).send({mensaje:"No se pudo editar la cantidad nueva del producto en el carrito"});
                
                    
                        Usuarios.findOne({carrito:{$elemMatch : {nombreProducto:parametros.nombreProducto}}}, (err, carritoEncontrado)=>{
    
                            if(err) return res.status(500).send({mensaje: "Error en la peticion"});
                            if(!carritoEncontrado) return res.status(500).send({mensaje:"No se pudo encontrar un carrito"});
                            
                            let subtotal = 0;
    
                            for(let i = 0; i < carritoEncontrado.carrito.length; i++){
                                if(carritoEncontrado.carrito[i].nombreProducto == parametros.nombreProducto){
    
                                    subtotal = carritoEncontrado.carrito[i].cantidadComprada * carritoEncontrado.carrito[i].precioUnitario;
                                }
                            }
    
                            Usuarios.findOneAndUpdate( {carrito:{$elemMatch : {nombreProducto: parametros.nombreProducto}}},
                                {"carrito.$.subtotal": subtotal }, {new: true}, (err, usuarioActualizado)=>{
                                if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                                if(!usuarioActualizado) return res.status(500).send({mensaje: 'No se puedo actualizar correctamente'});
    
                                let totalCarritoLocal = 0;
    
    
                                for (let i=0; i < usuarioActualizado.carrito.length; i++){
                                    totalCarritoLocal = totalCarritoLocal + usuarioActualizado.carrito[i].subtotal;
                                }
    
                                Usuarios.findByIdAndUpdate(usuarioLogueado, {totalCarrito: totalCarritoLocal}, {new:true},
                                    (err, totalActualizado)=>{
                                        if(err) return res.status(500).send({mensaje: 'Error en la peticion de Total Carrito'});
                                        if(!totalActualizado) res.status(500).send({mensaje: 'Error al modificar el total del carrito'});

                                        Usuarios.find({_id: usuarioLogueado},{"_id":0,"nombre":0, "usuario":0, "rol":0, "password":0}, (err, usuarioEncontrado)=>{
                                            if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                                            if(!usuarioEncontrado) return res.status(404).send({mensaje: 'No se pudo encontrar el usuario'});

                                            return res.status(200).send({cliente: usuarioEncontrado})

                                        })
                                    })
                            }) 
                        })
                    })
                })
            }
        })
    }) 
}


/* ELIMINAR UN PRODUCTO DEL CARRITO SI YA NO SE QUIERE COMPRAR (SOLO CLIENTES) */
function eliminarProductoCarrito(req, res){
    const usuarioLogueado = req.user.sub;
    const parametros = req.body;

    if(req.user.rol != 'ROL_CLIENTE')
    return res.status(404).send({mensaje: 'Solo los clientes pueden eliminar productos de su carrito'});

        Usuarios.findOne( {carrito:{$elemMatch : {nombreProducto: parametros.nombreProducto}}}, (err, usuarioEncontrado)=>{
            if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
            if(!usuarioEncontrado) return res.status(500).send({mensaje: 'No se encontro el producto'});

            Usuarios.updateOne({_id: usuarioLogueado},{ $pull: { carrito: {nombreProducto:parametros.nombreProducto} } }, (err, carritoEliminado)=>{
                if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                if(!carritoEliminado) return res.status(404).send({mensaje: 'No se pudo eliminar'})

                Usuarios.findOne( {_id: usuarioLogueado}, (err, usuarioEncontrado)=>{
                    if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                    if(!usuarioEncontrado) return res.status(500).send({mensaje: 'No se encontro el producto'});

                    let totalCarritoLocal = 0;

                    for (let i=0; i < usuarioEncontrado.carrito.length; i++){
                        totalCarritoLocal = totalCarritoLocal + usuarioEncontrado.carrito[i].subtotal;
                        console.log(totalCarritoLocal)
                    }

                    Usuarios.findByIdAndUpdate(usuarioLogueado, {totalCarrito: totalCarritoLocal}, {new:true},
                        (err, totalActualizado)=>{
                            if(err) return res.status(500).send({mensaje: 'Error en la peticion de Total Carrito'});
                            if(!totalActualizado) res.status(500).send({mensaje: 'Error al modificar el total del carrito'});

                            Usuarios.find({_id: usuarioLogueado},{"_id":0,"nombre":0, "usuario":0, "rol":0, "password":0}, (err, usuarioEncontrado)=>{
                                if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                                if(!usuarioEncontrado) return res.status(404).send({mensaje: 'No se pudo encontrar el usuario'});

                                return res.status(200).send({cliente: usuarioEncontrado})

                            })
                        })
                })

            })
        })

}


/* PASAR EL CARRITO A UNA FACTURA (SOLO CLIENTES)*/
function carritoAFactura(req, res){

    if(req.user.rol != 'ROL_CLIENTE')
    return res.status(404).send({mensaje: 'Solo los clientes pueden tener facturas'});

    var parametros = req.body;
    var facturaModel = new Factura();
    var IdUsuario = req.user.sub;

    Usuarios.findById(req.user.sub, (err, usuarioEncontrado)=>{
        if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
        if(!usuarioEncontrado) return res.status(500).send({mensaje: 'No se pudo encontrar un usuario'});

        if(parametros.nit){
            facturaModel.nit = parametros.nit;
            facturaModel.nombre = usuarioEncontrado.nombre;
            facturaModel.listaProductos = usuarioEncontrado.carrito;
            facturaModel.idUsuario = usuarioEncontrado._id;
            facturaModel.totalFactura = usuarioEncontrado.totalCarrito;
        

            facturaModel.save((err, facturaCreada)=>{
                if(err) return res.status(500).send({mensaje: 'Erro en la peticion'});
                if(!facturaCreada) return res.status(404).send({mensaje: 'No se pudo crear la factura'});

                Factura.findOne({_id: facturaCreada._id},{"_id":1,"nit":1,"listaProductos":1,"nombre": 1, "totalFactura":1},(err, facturaEncontrada)=>{
                    if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
                    if(!facturaEncontrada) return res.status(500).send({ mensaje: "Error al obtener la factura"});
        
                    facturaControlador.crearPDF(IdUsuario, facturaEncontrada);
                })

                
            return res.status(200).send({factura: facturaCreada});
            
        })


        for (let i = 0; i < usuarioEncontrado.carrito.length; i++) {
            Producto.findOneAndUpdate({nombre: usuarioEncontrado.carrito[i].nombreProducto},
                {  $inc : { cantidad: usuarioEncontrado.carrito[i].cantidadComprada * -1,
                    cantidadVendida: usuarioEncontrado.carrito[i].cantidadComprada }}, {new: true}, (err, productoModificado)=>{
                        if(err) return res.status(500).send({mensaje: 'Erro en la peticion'});
                        if(!productoModificado) return res.status(404).send({mensaje: 'No se pudo modificar el stock ni la cantidad vendida luego de crear la factura'});
                    })
        }

        Usuarios.findByIdAndUpdate(req.user.sub, {$set:{carrito: []}, totalCarrito: 0}, {new:true},
            (err, carritoVacio)=>{
                if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                if(!carritoVacio) res.status(404).send({mensaje: 'Error al vaciar el carrito y el total del carrito del cliente'});
            })


        }else{
            return res.status(500).send({mensaje: 'Debe ingresar el nit del cliente para poder generar la factura'});
        }
         
    })
}



module.exports = {
    administradorDefault,
    Login,
    registrarUsuario,
    editarRolUsuario,
    editarUsuario,
    eliminarUsuario,

    agregarProductoCarrito,
    eliminarProductoCarrito,
    carritoAFactura
}