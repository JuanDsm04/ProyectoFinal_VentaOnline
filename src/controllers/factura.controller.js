const Factura = require('../models/factura.model');
const Producto = require('../models/producto.model');

/* VISUALIZAR LAS FACTURAS DE LOS USUARIOS (SOLO ADMINISTRADORES)*/
function mostrarFacturasUsuarios(req, res){
    
    var idUsu = req.params.idUsuario;

    if(req.user.rol != 'ROL_ADMINISTRADOR')
    return res.status(500).send({mensaje:'Solo los administradores tienen acceso a este apartado'});

    Factura.find({idUsuario: idUsu},(err, facturaEncontrada)=>{

        if(err) return res.status(500).send({mensaje: 'Error en la peticion'});

        if(facturaEncontrada==0)
        return res.status(404).send({mensaje: 'Al parecer este usuario aun no tiene facturas'});

        if(!facturaEncontrada) return res.status(404).send({mensaje: 'Error, no se encontraron facturas'});
            
        return res.status(200).send({facturas: facturaEncontrada});
    })
}


/* VISUALIZAR LOS PRODUCTOS DE UNA FACTURA (SOLO ADMINISTRADORES)*/
function mostrarProductoFactura(req, res){
    var idFac = req.params.idFactura;

    if(req.user.rol != 'ROL_ADMINISTRADOR')
    return res.status(500).send({mensaje:'Solo los administradores tienen acceso a este apartado'});

    Factura.find({_id: idFac},{"_id":0,"nit":0, "idUsuario":0, "totalFactura":0},(err, facturaEncontrada)=>{

        if(err) return res.status(500).send({mensaje: 'Error en la peticion'});

        if(facturaEncontrada==0)
        return res.status(404).send({mensaje: 'Al parecer este usuario aun no tiene facturas'});

        if(!facturaEncontrada) return res.status(404).send({mensaje: 'Error, no se encontraron facturas'});
            
        return res.status(200).send({facturas: facturaEncontrada});
    })
}


/* VISUALIZAR LOS PRODUCTOS AGOTADOS (SOLO ADMINISTRADORES)*/
function mostrarProductosAgotados(req, res){
    if(req.user.rol != 'ROL_ADMINISTRADOR')
    return res.status(500).send({mensaje:'Los clientes no tienen acceso a este apartado'});

    Producto.find({cantidad: 0}, (err, productoEncontrado)=>{

        if(err) return res.status(500).send({mensaje: 'Error en la peticion'});

        if(productoEncontrado==0)
        return res.status(404).send({mensaje: 'Al parecer no hay productos que esten agotados'});

        if(!productoEncontrado) return res.status(404).send({mensaje: 'Error, no se encontraron los productos agotados'});
            
        return res.status(200).send({productos: productoEncontrado});
    }).sort( { cantidadVendida: -1 }).limit(3)
}


/* VISUALIZAR LOS PRODUCTOS MAS VENDIDOS (SOLO ADMINISTRADORES)*/
function mostrarProductosMasVendidos(req, res){
    if(req.user.rol != 'ROL_ADMINISTRADOR')
    return res.status(500).send({mensaje:'Los clientes pueden ver los productos mas vendidos desde su respectivo catalogo'});
 
    Producto.find((err, productoEncontrado)=>{
    
        if(err) return res.status(500).send({mensaje: 'Error en la peticion'});

        if(productoEncontrado==0)
        return res.status(404).send({mensaje: 'Al parecer no hay productos existentes como para mostrar los mas vendidos'});

        if(!productoEncontrado) return res.status(404).send({mensaje: 'Error, no se encontraron los productos mas vendidos'});
            
        return res.status(200).send({productos: productoEncontrado});
    }).sort( { cantidadVendida: -1 }).limit(3)

}


/* VISUALIZAR LAS COMPRAS REALIZADAS (SOLO CLIENTES) */
function mostrarComprasRealizadas(req, res){
    var idUsu = req.params.idUsuario;

    if(req.user.rol != 'ROL_CLIENTE')
    return res.status(500).send({mensaje:'Este apartado es solo para los clientes'});

    if(req.user.sub != idUsu)
    return res.status(500).send({mensaje: 'Como usted es un cliente solo puede ver las compras que usted a realizado'});

    Factura.find({idUsuario: idUsu},(err, facturaEncontrada)=>{

        if(err) return res.status(500).send({mensaje: 'Error en la peticion'});

        if(facturaEncontrada==0)
        return res.status(404).send({mensaje: 'Al parecer este usuario aun no tiene facturas'});

        if(!facturaEncontrada) return res.status(404).send({mensaje: 'Error, no se encontraron facturas'});
            
        return res.status(200).send({compras_realizadas: facturaEncontrada});
    })
}

module.exports = {
    mostrarFacturasUsuarios,
    mostrarProductoFactura,
    mostrarProductosAgotados,
    mostrarProductosMasVendidos,
    mostrarComprasRealizadas
}