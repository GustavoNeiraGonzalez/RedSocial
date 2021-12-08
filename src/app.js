const express = require('express');
const path = require('path');
const morgan = require('morgan');
const mysql = require('mysql');


const app = express();
//settings
app.set('port', process.env.PORT || 3000) //significa que revise el puerto
//en el sistema operativo y si no existe, entonces que cree el puerto 3000
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'))
//settings

//middlewares (ejecuta funciones primero(antes de las que pide el usuario))
app.use(morgan('dev'));


//middlewares

app.listen(app.get('port'), () =>{
    console.log('Server on port 3000');
})