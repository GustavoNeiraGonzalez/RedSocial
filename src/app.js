const express = require('express');
const path = require('path');
const morgan = require('morgan');
const mysql = require('mysql');
const myConnection = require('express-myconnection');

const app = express();

const dotenv = require('dotenv');

const bcryptjs = require('bcryptjs');
dotenv.config({path:'./env/.env'});



//importing routes
const publicacionRoutes = require('./routes/publicacion');


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
//middlewares

//routes
app.use('/', publicacionRoutes);
//routes
//static files
app.use(express.static(path.join(__dirname, 'public')));
//static files



app.listen(app.get('port'), () =>{
    console.log('Server on port 3000');
})