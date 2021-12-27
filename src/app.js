const express = require('express');
const path = require('path');
const morgan = require('morgan');
const mysql = require('mysql');
const myConnection = require('express-myconnection');

const app = express();
const dotenv = require('dotenv');

const bcryptjs = require('bcryptjs');
dotenv.config({path:'./env/.env'});
const session = require('express-session');
app.use(session({
    secret:'secret',
    resave:true,
    saveUnitialized:true
}))

//importing routes
const publicacionRoutes = require('./routes/publicacion');
const connection = require('../database/db');


//settings
app.set('port', process.env.PORT || 3000) //significa que revise el puerto
//en el sistema operativo y si no existe, entonces que cree el puerto 3000
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'))
//settings

//middlewares (ejecuta funciones primero(antes de las que pide el usuario))
app.use(morgan('dev'));
app.use(myConnection(mysql, {
    host:'localhost',
    user: 'root',
    password: 'as#91k.##',
    port:3306,
    database: 'redsocial'
}, 'single'))
app.use(express.urlencoded({extend: false}));
app.use(express.json());
//middlewares

//routes
app.use('/', publicacionRoutes);
//routes
//static files
app.use(express.static(path.join(__dirname, 'public')));
//static files

app.post('/register', async (req,res)=>{
    const nombre = req.body.nombre;
    const usuario = req.body.usuario;
    const contraseña = req.body.contraseña;
    const email = req.body.email;
    let passwordHaash = await bcryptjs.hash(contraseña,8);
    connection.query('INSERT INTO usuarios set ?', {nombre:nombre, usuario:usuario, contraseña:passwordHaash,email:email}, async(error, results)=>{
        if(error){
            console.log("error al insertar dato usuario:"+error);
        }else{
            res.render('login',{
                alert: true,
                alertTitle: "Registración Exitosa",
                alertMessage:"Felicidades, la registración ha sido un exito.",
                alertIcon:"success",
                showConfirmButton:false,
                timer:1500,
                ruta:''
            });
        }
    });
});
app.get('/asd',(req,res) => {
    res.render('login.ejs')
});
app.listen(app.get('port'), () =>{
    console.log('Server on port 3000');
    console.log(__dirname);
})