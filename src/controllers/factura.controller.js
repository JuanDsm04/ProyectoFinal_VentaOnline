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


//PDF DE FACTURA AL CONFIRMARLA
function crearPDF(idFac, facturaEncontrada) { 
    const fs = require('fs');

    const Pdfmake = require('pdfmake');

    var fonts = {
        Roboto: {
            normal: './fonts/roboto/Roboto-Regular.ttf',
            bold: './fonts/roboto/Roboto-Medium.ttf',
            italics: './fonts/roboto/Roboto-Italic.ttf',
            bolditalics: './fonts/roboto/Roboto-MediumItalic.ttf'
        }
    };

    let pdfmake = new Pdfmake(fonts);

    let content = [{
        text: "FACTURA",
        fontSize: 43,
        color: '#1A5276',
        bold: true,
    }]

    content.push({
        text: '   ',
        fontSize: 15,
        bold: true,
    })

    content.push({
        text: '====================================================================',
        color: '#1A5276',
    })

    content.push({
        text: 'ID: '+facturaEncontrada._id +"\n",
        fontSize: 15,
        bold: true,
    })

    content.push({
        text: 'Nombre: ' +facturaEncontrada.nombre +"\n",
        fontSize: 15,
        bold: true,
    })

    content.push({
        text: 'NIT: '+facturaEncontrada.nit +"\n",
        fontSize: 15,
        bold: true,
    })

    content.push({
        text: '====================================================================' +"\n" +"\n",
        color: '#1A5276',
    })

    content.push({
        text: '---------------------------------------------------------------------------------------------------------------------------------------',
        color: '#1A5276',
    })

    for(let i = 0; i < facturaEncontrada.listaProductos.length; i++){
        var nombre = 'Nombre: '+facturaEncontrada.listaProductos[i].nombreProducto;
        var cantidad = 'Cantidad: '+facturaEncontrada.listaProductos[i].cantidadComprada;
        var precioUnitario = 'Precio Unitario: Q'+facturaEncontrada.listaProductos[i].precioUnitario;
        var subtotal = 'Subtotal: Q'+facturaEncontrada.listaProductos[i].subtotal;

        content.push({
            text: nombre
        })

        content.push({
            text: cantidad
        })

        content.push({
            text: precioUnitario
        })

        content.push({
            text: subtotal,
            alignment: 'right'
        })

        content.push({
            text: '---------------------------------------------------------------------------------------------------------------------------------------',
            color: '#1A5276',
        })
    }

    content.push({
        text: 'TOTAL: Q'+facturaEncontrada.totalFactura,
        color: '#1A5276',
        bold: true,
        fontSize: 14,
        alignment: 'right'
    })
    
    let footerPdf = {
        
        background: function () {
            return {
                canvas: [
                    {
                        color: '#1A5276',
                        type: 'rect',
                        x: 0, y: 0, w: 595, h: 45
                        
                    },
                    {
                        color: '#AED6F1',
                        type: 'rect',
                        x: 0, y: 20, w: 595, h: 80
                        
                    }
                ]
            };
        },

        content: content,
        pageMargins: [72, 41, 72, 60],
    }

    pdfDoc = pdfmake.createPdfKitDocument(footerPdf, {});
    pdfDoc.pipe(fs.createWriteStream('pdfs/factura-'+facturaEncontrada._id+'.pdf'));
    pdfDoc.end();
}



module.exports = {
    mostrarFacturasUsuarios,
    mostrarProductoFactura,
    mostrarProductosAgotados,
    mostrarProductosMasVendidos,
    mostrarComprasRealizadas,
    crearPDF
}