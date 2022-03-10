const Producto = require('../models/producto.model');
const Categoria = require('../models/categoria.model');
const bcrypt = require('bcrypt-nodejs')
const jwt = require('../services/jwt');


/* AGREGAR PRODUCTO (SOLO ADMINISTRADORES)*/
function agregarProducto(req, res){
    var parametros = req.body;
    var productoModel = new Producto();

    if ( req.user.rol != 'ROL_ADMINISTRADOR' ) 
    return res.status(500).send({ mensaje: 'Solo los admnistradores pueden agregar nuevos productos'});

    if (parametros._id != null)
    return res.status(500).send({ mensaje: 'No se puede elegir el id'});
    
    if ( parametros.cantidadVendida !=null ) 
    return res.status(500).send({ mensaje: 'No puede ingresar manualmente la cantidad vendida'});

    if ( parametros.cantidad !=null ) 
    return res.status(500).send({ mensaje: 'La cantidad del producto se maneja por medio del control de stock'});

    if(parametros.nombre && parametros.precio && parametros.idCategoria){
        productoModel.nombre = parametros.nombre;
        productoModel.cantidad = 0;
        productoModel.precio = parametros.precio;
        productoModel.idCategoria = parametros.idCategoria;
        productoModel.cantidadVendida = 0;
        
        Categoria.find({_id: parametros.idCategoria}, (err, categoriaEncontrada)=>{
            if(err) return res.status(500).send({mensaje: 'Ocurrio un error'});

            if(categoriaEncontrada == 0)
            return res.status(500).send({mensaje: 'El id de categoria ingresado no existe, asegurese de ingresar el id de una categoria existente'})

            Producto.find({nombre: parametros.nombre}, (err, productoEncontrado)=>{
                if (productoEncontrado.length == 0){
                    productoModel.save((err, productoGuardado)=>{
                        if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                        if(!productoGuardado) return res.status(500).send({mensaje: 'Error al agregar el Producto'});
    
                        return res.status(200).send({producto: productoGuardado});
                    });
                }else{
                    return res.status(500).send({mensaje:'Este producto ya existe'});
                }
            })
        })

        
    }else{
        return res.status(500).send({mensaje: "Debe rellenar los campos necesarios"});
    }
}


/* VISUALIZAR EL Y LOS PRODUCTOS (SOLO ADMINISTRADORES) */
/* Un producto */
function obtenerProductoId(req, res){
    var idProd = req.params.idProducto;
    
    if(req.user.rol != 'ROL_ADMINISTRADOR')
    return res.status(404).send ({mensaje: 'Solo los administradores puede ver los productos de esta forma'});

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
    return res.status(404).send ({mensaje: 'Solo los administradores puede ver los productos de esta forma'});

    Producto.find((err, productoEncontrado)=>{
        if(err) res.status(500).send({mensaje: 'Error en la peticion'});
        if(!productoEncontrado) res.status(404).send({mensaje: 'No se pudo encontrar productos'})

        return res.status(200).send({producto: productoEncontrado});
    })
}


/* EDITAR PRODUCTO (SOLO ADMINISTRADORES)*/
function editarProducto(req, res){
    var idProd = req.params.idProducto;
    var parametros = req.body;

    if(req.user.rol != 'ROL_ADMINISTRADOR')
    return res.status(404).send ({mensaje: 'Solo los administradores pueden editar los productos'});
    
    if (parametros._id != null)
    return res.status(500).send({ mensaje: 'No se puede editar el id'});
    

    if (parametros.cantidad != null)
    return res.status(500).send({ mensaje: 'La cantidad del producto la puede modificar desde el control de stock'});
    

    if (parametros.cantidadVendida != null)
    return res.status(500).send({ mensaje: 'La cantidad vendida no puede ser editada'});
    

    Producto.find({nombre: parametros.nombre}, (err, productoEncontrado)=>{
        if (productoEncontrado.length == 0){

            if(parametros.idCategoria != null){
                Categoria.find({_id: parametros.idCategoria}, (err, categoriaEncontrada)=>{
                    if(err) return res.status(500).send({mensaje: 'Ocurrio un error, asegurese de que el id de categoria pertenezca a una categoria existente'})
                    if (categoriaEncontrada.length != 0){
                        Producto.findByIdAndUpdate(idProd, parametros, {new : true},(err, productoActualizado)=>{
                            if(err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                            if(!productoActualizado) return res.status(500).send({ mensaje: 'Error al editar el producto'});
                            
                            return res.status(200).send({producto : productoActualizado})
                        })
                    }else{
                        return res.status(500).send({mensaje:'El id de categoria no pertenece a ninguna categoria existente, intente con otro'});
                    }
                })
            }else{
                Producto.findByIdAndUpdate(idProd, parametros, {new : true},(err, productoActualizado)=>{
                    if(err) return res.status(500).send({ mensaje: 'Ocurrio un error' });
                    if(!productoActualizado) return res.status(500).send({ mensaje: 'Error al editar el producto'});
                    
                    return res.status(200).send({producto : productoActualizado})
                })
            }
        }else{
            return res.status(500).send({mensaje:'Este nombre de producto ya existe, intente con otro'});
        }
    })
}


/* CONTROLAR EL STOCK DE UN PRODUCTO (SOLO ADMINISTRADORES)*/
function stockProducto(req, res){
    const productoId = req.params.idProducto;
    const parametros = req.body;

    if(req.user.rol != 'ROL_ADMINISTRADOR')
    return res.status(404).send ({mensaje: 'Solo los administradores pueden controlar el stock de los productos'});

    if (parametros.cantidad < 0){
        var CantidadNegativa = parametros.cantidad * -1;

        Producto.findById(productoId, (err, productoEncontrado)=>{ 
            if(err) return res.status(500).send({mensaje:'Ocurrio un error'});
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


/* CATALOGO DE PRODUCTOS MAS VENDIDOS (PARA EL CLIENTE)*/
function productosMasVendidos(req, res){

    if(req.user.rol != 'ROL_CLIENTE')
    return res.status(500).send({mensaje:'El catalogo de productos mas vendidos es para los clientes, pero puede visualizarlos desde el apartado correspondiente de los Administradores'});
 
    Producto.find({},{"_id":0,"nombre":1, "cantidad":1, "precio":1, "cantidadVendida": 1}, (err, productoEncontrado)=>{
    
        if(err) return res.status(500).send({mensaje: 'Error en la peticion'});

        if(productoEncontrado==0)
        return res.status(404).send({mensaje: 'Al parecer no hay productos existentes como para mostrar los mas vendidos'});

        if(!productoEncontrado) return res.status(404).send({mensaje: 'Error, no se encontraron los productos mas vendidos'});
            
        return res.status(200).send({productos: productoEncontrado});
    }).sort( { cantidadVendida: -1 }).limit(3)

}


/* BUSCAR LOS PRODUCTOS POR SU NOMBRE (PARA EL CLIENTE) */
function buscarProductoNombre(req, res){
    var nombreProduc = req.params.nombreProducto;
	
    if(req.user.rol != 'ROL_CLIENTE')
    return res.status(500).send({mensaje:'Esta busqueda es espefica para los clientes'})

	Producto.find({nombre: nombreProduc},{"_id":0,"nombre":1, "cantidad":1, "precio":1}, (err, productoEncontrado)=>{
		
		if(err) return res.status(500).send({mensaje: 'Error en la peticion'});

        if(productoEncontrado==0)
        return res.status(404).send({mensaje: 'No se encontraron productos con ese nombre'});

		if(!productoEncontrado) return res.status(404).send({mensaje: 'Error, no se encontro un producto'});
        	
		return res.status(200).send({producto: productoEncontrado});
	})
}


/* MOSTRAR LOS PRODUCTOS POR CATEGORIA (PARA EL CLIENTE)*/
function mostrarProductoPorCategoria(req, res){
    var nombreCate = req.params.nombreCategoria;

    if(req.user.rol != 'ROL_CLIENTE')
    return res.status(500).send({mensaje:'Este tipo de busqueda es espefica para los clientes'})

    Categoria.findOne({nombre: nombreCate}, (err, categoriaEncontrada)=>{
        if(err) return res.status(500).send({mensaje: 'Ocurrio un error'});
        if(!categoriaEncontrada) return res.status(500).send({mensaje: 'No se encontro una categoria con ese nombre'})

        if(categoriaEncontrada != 0 ){
            
            Producto.find({idCategoria: categoriaEncontrada._id},{"_id":0,"nombre":1, "cantidad":1, "precio":1}, (err, productoEncontrado)=>{
                if(err) return res.status(500).send({mensaje: 'Error en la peticion'});

                if(productoEncontrado==0)
                return res.status(404).send({mensaje: 'No se encontraron productos en esta categoria'});

                if(!productoEncontrado) return res.status(404).send({mensaje: 'Error, no se encontro un producto'});
                    
                return res.status(200).send({producto: productoEncontrado});
            })

        }else{
            return res.status(500).send({mensaje: 'No se encontro una categoria con ese nombre'})
        }
    })

}



module.exports = {
    agregarProducto,
    obtenerProductoId,
    visualizarProductos,
    editarProducto,
    stockProducto,
    buscarProductoNombre,
    mostrarProductoPorCategoria,
    productosMasVendidos
}