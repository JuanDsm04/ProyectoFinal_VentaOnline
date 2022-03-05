const Producto = require('../models/producto.model');
const Categoria = require('../models/categoria.model');
const bcrypt = require('bcrypt-nodejs')
const jwt = require('../services/jwt');


/* AGREGAR PRODUCTO */
function agregarProducto(req, res){
    var parametros = req.body;
    var productoModel = new Producto();

    if (parametros._id != null)
        return res.status(500).send({ mensaje: 'No se puede elegir el id'});
    
    if ( req.user.rol == 'ROL_CLIENTE' ) 
        return res.status(500).send({ mensaje: 'El cliente no puede agregar un nuevo producto'});

    if ( parametros.cantidadVendida !=null ) 
        return res.status(500).send({ mensaje: 'No puede ingresar manualmente la cantidad vendida'});

    if ( parametros.cantidad !=null ) 
        return res.status(500).send({ mensaje: 'La cantidad se maneja por medio del control de stock'});

    if(parametros.nombre && parametros.precio && parametros.idCategoria){
        productoModel.nombre = parametros.nombre;
        productoModel.cantidad = 0;
        productoModel.precio = parametros.precio;
        productoModel.idCategoria = parametros.idCategoria;
        productoModel.cantidadVendida = 0;
        
        Producto.find({nombre: parametros.nombre}, (err, productoEncontrado)=>{
            if (productoEncontrado.length == 0){
                productoModel.save((err, productoGuardado)=>{
                    if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                    if(!productoGuardado) return res.status(500).send({mensaje: 'Error al agregar el Producto'});

                    return res.status(200).send({empresa: productoGuardado});
                });
            }else{
                return res.status(500).send({mensaje:'Este producto ya existe'});
            }
        })
    }else{
        return res.status(500).send({mensaje: "Debe rellenar los campos necesarios"});
    }
}


/* VER EL Y LOS PRODUCTOS */
/* Un producto */
function obtenerProductoId(req, res){
    var idProd = req.params.idProducto;
    
    if(req.user.rol != 'ROL_ADMINISTRADOR')
    return res.status(404).send ({mensaje: 'Solo el administrador puede ver los productos de esta forma'});

    Producto.findById(idProd,(err, productoEncontrado) => {
        if(err) return res.status(500).send({mensaje: 'Error en la peticion'});

        if(productoEncontrado==0)
        return res.status(404).send({mensaje: 'No se encontraron productos'});

        if(!productoEncontrado) return res.status(404).send({mensaje: 'Error al obtener los datos'});
        return res.status(200).send({producto: productoEncontrado});
    })
}

/* Todos los productos */
function visualizarProductos(req, res){

    if(req.user.rol != 'ROL_ADMINISTRADOR')
    return res.status(404).send ({mensaje: 'Solo el administrador puede ver los productos de esta forma'});

    Producto.find((err, productoEncontrado)=>{
        for(let i = 0; i < productoEncontrado.length; i++){
            return res.status(200).send({producto: productoEncontrado});
        }
    })
}


/* EDITAR PRODUCTO */
function editarProducto(req, res){
    var idProd = req.params.idProducto;
    var parametros = req.body;

    if(req.user.rol != 'ROL_ADMINISTRADOR')
    return res.status(404).send ({mensaje: 'Solo el administrador puede editar los productos'});
    
    if (parametros._id != null)
    return res.status(500).send({ mensaje: 'No se puede editar el id'});
    

    if (parametros.cantidad != null)
    return res.status(500).send({ mensaje: 'La cantidad la puede modificar desde el control de stock'});
    

    if (parametros.cantidadVendida != null)
    return res.status(500).send({ mensaje: 'La cantidad vendida no puede ser editada'});
    

    Producto.find({nombre: parametros.nombre}, (err, productoEncontrado)=>{
        if (productoEncontrado.length == 0){

            if(parametros.categoria != null){
                Categoria.find({_id: parametros.idCategoria}, (err, categoriaEncontrada)=>{
                    if (categoriaEncontrada.length != 0){
                        Producto.findByIdAndUpdate(idProd, parametros, {new : true},(err, productoActualizado)=>{
                            if(err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                            if(!productoActualizado) return res.status(500).send({ mensaje: 'Error al editar el producto'});
                            
                            return res.status(200).send({producto : productoActualizado})
                        })
                    }else{
                        if(err) return res.status(500).send({mensaje: 'Ocurrio un error'})
                        return res.status(500).send({mensaje:'Este ID no pertenece a ninguna categoria existente, intente con otro'});
                    }
                })
            }else{
                Producto.findByIdAndUpdate(idProd, parametros, {new : true},(err, productoActualizado)=>{
                    if(err) return res.status(500).send({ mensaje: 'Error, asegurese de que el ID pertenezca a una categoria existente' });
                    if(!productoActualizado) return res.status(500).send({ mensaje: 'Error al editar el producto'});
                    
                    return res.status(200).send({producto : productoActualizado})
                })
            }
        }else{
            return res.status(500).send({mensaje:'Este nombre de producto ya existe, intente con otro'});
        }
    })
}

/* CONTROLAR EL STOCK DE UN PRODUCTO */
function stockProducto(req, res){
    const productoId = req.params.idProducto;
    const parametros = req.body;

    if(req.user.rol != 'ROL_ADMINISTRADOR')
    return res.status(404).send ({mensaje: 'Solo el administrador puede controlar el stock de los productos'});

    if (parametros.cantidad < 0){
        var CantidadNegativa = parametros.cantidad * -1;

        Producto.findById(productoId, (err, productoEncontrado)=>{ 
            if (productoEncontrado.cantidad  < CantidadNegativa )
            return res.status(500).send({mensaje: 'No hay sufiente stock como para eliminar esa cantidad. Cantidad actual: '+productoEncontrado.cantidad})
            
            ultimaCantidad = CantidadNegativa * -1;
            Producto.findByIdAndUpdate(productoId, { $inc :{ cantidad: ultimaCantidad } }, {new: true}, (err, productoModificado)=>{
                if(err) return res.status(500).send({mensaje: "Error en la peticion"});
                if(!productoModificado) return res.status(500).send({mensaje: "Error al editar la cantidad del Producto"});
        
                return res.status(200).send({producto: productoModificado})
            })
  
        })
    }else{
        Producto.findByIdAndUpdate(productoId, { $inc :{ cantidad: parametros.cantidad } }, {new: true}, (err, productoModificado)=>{
            if(err) return res.status(500).send({mensaje: "Error en la peticion"});
            if(!productoModificado) return res.status(500).send({mensaje: "Error al editar la cantidad del Producto"});
    
            return res.status(200).send({producto: productoModificado})
        })
    }
}


module.exports = {
    agregarProducto,
    obtenerProductoId,
    visualizarProductos,
    editarProducto,
    stockProducto
}