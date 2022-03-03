const Categoria = require('../models/categoria.model');
const Producto = require('../models/producto.model');
const bcrypt = require('bcrypt-nodejs')
const jwt = require('../services/jwt');
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

/* AGREGAR UNA CATEGORIA */
function agregarCategoria(req, res){
    var parametros = req.body;
    var categoriaModel = new Categoria();

    if (parametros._id != null){
        return res.status(500).send({ mensaje: 'No se puede elegir el id'});
    }

    if ( req.user.rol == 'ROL_CLIENTE' ) 
        return res.status(500).send({ mensaje: 'El cliente no puede agregar una nueva categoria'});

    if(parametros.nombre){
        categoriaModel.nombre = parametros.nombre;
        
        Categoria.find({nombre: parametros.nombre}, (err, categoriaEncontrada)=>{
            if (categoriaEncontrada.length == 0){
                categoriaModel.save((err, categoriaGuardada)=>{
                    if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                    if(!categoriaGuardada) return res.status(500).send({mensaje: 'Error al agregar la Categoria'});

                    return res.status(200).send({empresa: categoriaGuardada});
                });
            }else{
                return res.status(500).send({mensaje:'Esta categoria ya existe'});
            }
        })
    }else{
        return res.status(500).send({mensaje: "Debe rellenar los campos necesarios"});
    }
}

/* VISUALIZAR TODAS LAS CATEGORIAS */
function visualizarCategorias(req, res){
    Categoria.find((err, categoriaEncontrada)=>{
        for(let i = 0; i < categoriaEncontrada.length; i++){
            return res.status(200).send({categoria: categoriaEncontrada});
        }
    })
}

/* EDTIAR UNA CATEGORIA */
function editarCategoria(req, res){
    var idCat = req.params.idCategoria;
    var parametros = req.body;

    if (parametros._id != null){
        return res.status(500).send({ mensaje: 'No se puede editar el id'});
    }

    if ( req.user.rol == 'ROL_CLIENTE' ) 
        return res.status(500).send({ mensaje: 'El cliente no puede editar categorias'});

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

/* ELIMINAR UNA CATEGORIA (Si tiene productos estos pasaran automaticamente a la categoria default) */
function eliminarCategoria(req, res){
    var idCat = req.params.idCategoria;

    if ( req.user.rol == 'ROL_CLIENTE' ) 
        return res.status(500).send({ mensaje: 'El cliente no puede eliminar categorias'});

    Categoria.findOne({nombre:'default'},(err, categoriaEncontrada) =>{
        Producto.updateMany({idCategoria:idCat},{idCategoria: mongoose.Types.ObjectId(categoriaEncontrada._id)},(err, actualizacion)=>{
            Categoria.findOneAndDelete({_id: idCat} , (err, categoriaEliminada)=> {
                if (err)return res.status(500).send({mensaje: 'Error en la peticion'});
                if (!categoriaEliminada)return res.status(404).send({mensaje: 'No se pudo Eliminar'});
                return res.status(200).send({mensaje: categoriaEliminada});
            })
        })
    })
}



module.exports = {
    categoriaDefault,
    agregarCategoria,
    visualizarCategorias,
    editarCategoria,
    eliminarCategoria

}