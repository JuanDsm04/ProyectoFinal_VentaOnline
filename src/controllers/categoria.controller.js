const Categoria = require('../models/categoria.model');
const Producto = require('../models/producto.model');

const mongoose = require('mongoose');

/* CATEGORIA DEFAULT */
function categoriaDefault(){
    Categoria.find({nombreCategoria:'default'}, (err, categoriaEncontrada)=>{
        if(categoriaEncontrada.length == 0){
            Categoria.create({
                nombre: 'default'
            })
        }
    });
}


/* AGREGAR UNA CATEGORIA (SOLO ADMINISTRADORES)*/
function agregarCategoria(req, res){
    var parametros = req.body;
    var categoriaModel = new Categoria();

    if (parametros._id != null)
    return res.status(500).send({ mensaje: 'No se puede elegir el id'});
    

    if ( req.user.rol != 'ROL_ADMINISTRADOR' ) 
    return res.status(500).send({ mensaje: 'Solo los administradores pueden agregar una nueva categoria'});

    if(parametros.nombre){
        categoriaModel.nombre = parametros.nombre;
        
        Categoria.find({nombre: parametros.nombre}, (err, categoriaEncontrada)=>{
            if (categoriaEncontrada.length == 0){
                categoriaModel.save((err, categoriaGuardada)=>{
                    if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                    if(!categoriaGuardada) return res.status(500).send({mensaje: 'Error al agregar la Categoria'});

                    return res.status(200).send({categoria: categoriaGuardada});
                });
            }else{
                return res.status(500).send({mensaje:'Esta categoria ya existe'});
            }
        })
    }else{
        return res.status(500).send({mensaje: "Debe rellenar los campos necesarios"});
    }
}


/* VISUALIZAR TODAS LAS CATEGORIAS (PARA ADMINISTRADORES) */
function visualizarCategorias(req, res){

    if ( req.user.rol != 'ROL_ADMINISTRADOR' ) 
    return res.status(500).send({ mensaje: 'Los clientes pueden visualizar las categorias desde su propio apartado'});
    
    Categoria.find((err, categoriaEncontrada)=>{
        for(let i = 0; i < categoriaEncontrada.length; i++){
            return res.status(200).send({categorias: categoriaEncontrada});
        }
    })
}


/* EDTIAR UNA CATEGORIA (SOLO ADMINISTRADORES)*/
function editarCategoria(req, res){
    var idCat = req.params.idCategoria;
    var parametros = req.body;

    if (parametros._id != null){
        return res.status(500).send({ mensaje: 'No se puede editar el id'});
    }

    if ( req.user.rol != 'ROL_ADMINISTRADOR' ) 
    return res.status(500).send({ mensaje: 'Solo los administradores pueden editar las categorias'});

    Categoria.find({nombre: parametros.nombre}, (err, categoriaEncontrada)=>{
        if (categoriaEncontrada.length == 0){
            Categoria.findByIdAndUpdate(idCat, parametros, {new : true},(err, categoriaActualizada)=>{
                if(err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                if(!categoriaActualizada) return res.status(500).send({ mensaje: 'Error al editar la Categoria'});
                
                return res.status(200).send({categoria : categoriaActualizada})
            })
                    
        }else{
            return res.status(500).send({mensaje:'Este nombre de categoria ya existe'});
        }
    })

}


/* ELIMINAR UNA CATEGORIA (SOLO ADMINISTRADORES) (Si tiene productos, estos pasaran automaticamente a la categoria default) */
function eliminarCategoria(req, res){
    var idCat = req.params.idCategoria;

    if ( req.user.rol != 'ROL_ADMINISTRADOR' ) 
    return res.status(500).send({ mensaje: 'Solo los administradores pueden eliminar categorias'});

    Categoria.findOne({nombre:'default'},(err, categoriaEncontrada) =>{
        Producto.updateMany({idCategoria:idCat},{idCategoria: mongoose.Types.ObjectId(categoriaEncontrada._id)},(err, actualizacion)=>{
            if(err) return res.status(500).send({mensaje: 'Ocurrio un error al editar los productos con esta categoria'});
            if(!actualizacion) return res.status(404).send({mensaje: 'No se pudo editar el producto con esta categoria'});
            Categoria.findOneAndDelete({_id: idCat} , (err, categoriaEliminada)=> {
                if (err)return res.status(500).send({mensaje: 'Error en la peticion'});
                if (!categoriaEliminada)return res.status(404).send({mensaje: 'No se pudo eliminar la categoria'});
                return res.status(200).send({categoria: categoriaEliminada});
            })
        })
    })
}


/* MOSTRAR LAS CATEGORIAS EXISTENTES (PARA EL CLIENTE) */
function mostrarCategorias(req, res){
	
    if(req.user.rol != 'ROL_CLIENTE')
    return res.status(500).send({mensaje:'Esta opcion es espefica para los clientes'})

	Categoria.find({},{"_id":0,"nombre":1}, (err, categoriaEncontrada)=>{
		
		if(err) return res.status(500).send({mensaje: 'Error en la peticion'});

        if(categoriaEncontrada==0)
        return res.status(404).send({mensaje: 'No se encontraron categorias existentes'});

		if(!categoriaEncontrada) return res.status(404).send({mensaje: 'Error, no se encontraron categorias'});
        	
		return res.status(200).send({categorias: categoriaEncontrada});
	})
}


module.exports = {
    categoriaDefault,
    agregarCategoria,
    visualizarCategorias,
    editarCategoria,
    eliminarCategoria,
    mostrarCategorias

}