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
                timer:3500,
                ruta:''
            });
        }
    });
});
app.get('/asd',(req,res) => {
    res.render('login.ejs')
});
app.post('/auth', async (req, res)=>{
    const usuario = req.body.usuario;
    const pass = req.body.contraseña;
    let passwordHassh = await bcryptjs.hash(pass,8);
    if(usuario && pass){
        connection.query('Select * from usuarios where usuario = ?', [usuario], async (error, results)=>{
            if(error){
                console.log("error al insertar dato usuario:"+error);
            }else if(results.length == 0 || !(await bcryptjs.compare(pass, results[0].contraseña))){
                res.render('login', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "USUARIO y/o PASSWORD incorrectas",
                    alertIcon:'error',
                    showConfirmButton: true,
                    timer: 4000,
                    ruta: ''    
                });
            }else{
                req.session.loggedin = true;                
				req.session.nombre = results[0].nombre;
				res.render('login', {
					alert: true,
					alertTitle: "Conexión exitosa",
					alertMessage: "¡LOGIN CORRECTO!",
					alertIcon:'success',
					showConfirmButton: false,
					timer: 1500,
					ruta: ''
				});        			
            }
        })
    }else{

    }
});
app.get('/', (req, res)=>{
    if(req.session.loggedin){
        res.render('muro.ejs',{
            login: true,
            name: req.session.name
        });
    }else{
        res.render('muro.ejs',{
            login:false,
            name:'Debe iniciar sesión'
        })
        }
    }
});
app.listen(app.get('port'), () =>{
    console.log('Server on port 3000');
    console.log(__dirname);
})