const express = require('express');
const path = require('path');
const morgan = require('morgan');
const mysql = require('mysql');
const myConnection = require('express-myconnection');
const nodemailer = require("nodemailer");

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

app.post("/send-email", (req,res) => {
    var transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        post: 587,
        secure: false,
        auth: {
            user: "rachelle.brown@ethereal.email",
            pass:"SnVyCNWnPfpEQnt1Wd"
        },
    });
    var mailOptions = {
        from: "rachelle.brown@ethereal.email",
        to: "gustavoeduardoneiragonzalez@gmail.com",
        subject: "enviado desde nodemailer",
        text: "holamundo"
    }

    transporter.sendMail(mailOptions,(err, info) =>{
        if(err){
            res.status(500).send(err.message)
        }else{
            console.log("Email enviado.");
            res.status(200).jsonp(req.body)
        }
    })
})


app.post('/register', async (req,res)=>{
    const nombre = req.body.nombre;
    const usuario = req.body.usuario;
    const contraseña = req.body.contraseña;
    const email = req.body.email;
    let passwordHaash = await bcryptjs.hash(contraseña,8);
    const emailregex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    if(emailregex.test(email)){
        connection.query('INSERT INTO usuarios set ?', {nombre:nombre, usuario:usuario, contraseña:passwordHaash,email:email}, async(error, results)=>{
            if(error){
                if(error.fatal){
                    console.trace('fatal error: ' + err.message);
                    console.log("ERROR FATAL insertar dato usuario:"+error);
                    res.json('ERROR FATAL insertar datos en usuarios'+error)
                }else{
                    console.log("error al insertar dato usuario:"+error);
                    res.json('error al insertar datos en usuarios'+error);    
                }
                res.end();
            }else{
                res.render('login',{
                    alert: true,
                    alertTitle: "Registración Exitosa",
                    alertMessage:"Felicidades, la registración ha sido un exito.",
                    alertIcon:"success",
                    showConfirmButton:false,
                    timer:3500,
                    ruta:'/login'
                });

                res.end();
            }
        });
    }else{
        res.render('login',{
            alert: true,
            alertTitle: "Debe poner un correo valido",
            alertMessage:"Debe poner un correo valido.",
            alertIcon:"error",
            showConfirmButton:true,
            timer:3500,
            ruta:'/login'
        });
    }
    
});
app.get('/login',(req,res) => {
    res.render('login.ejs')
});

app.post('/auth', async (req, res)=>{
    const usuario = req.body.usuario;
    const pass = req.body.contraseña;
    let passwordHassh = await bcryptjs.hash(pass,8);
    if(usuario && pass){
        connection.query('Select * from usuarios where usuario = ?', [usuario], async (error, results)=>{
            if(results.length == 0 || !(await bcryptjs.compare(pass, results[0].contraseña))){
                res.render('login', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "USUARIO y/o PASSWORD incorrectas",
                    alertIcon:'error',
                    showConfirmButton: true,
                    timer: 4000,
                    ruta: '/login'    
                });
            }else if(error){
                res.json('Error fatal al intentar iniciar sesion '+err)
                console.log('Error fatal al intentar iniciar sesion '+error);
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
					ruta: '/'
				});        			
            }
            
            res.end();
        })
    }else{
        res.send('Please enter user and Password!');
		res.end();
    }
});
app.get('/', (req, res)=>{
    if(req.session.loggedin) {
        req.getConnection((err,conn) =>{
            if(err){
                res.json('error al requerir inicio de ssion '+err)
                res.end();
            }else{
                conn.query('select * from publicacion', (err, publicaciones) =>{
                    if (err){
                        res.json('error datos publicacion'+err)
                    }
                    else{
                        console.log(publicaciones);
                        res.render('muro', {/* aqui evitamos que aparezca variable is not defined
                            */
                            data: publicaciones,
                            login: true,
                            nombre: req.session.nombre,
                            error:false
                        })
                    }
                })
            }
        });
    }else{
        res.render('muro',{
            login:false,
            nombre:'Debe iniciar sesión'
        });
    }

});
app.get('/Chats', (req, res)=>{
    if(req.session.loggedin) {
        req.getConnection((err,conn) =>{
            if(err){
                res.json('error al requerir inicio de ssion '+err)
                res.end();
            }else{
                conn.query('select * from publicacion', (err, publicaciones) =>{
                    if (err){
                        res.json('error datos publicacion'+err)
                    }
                    else{
                        console.log(publicaciones);
                        res.render('chats', {/* aqui evitamos que aparezca variable is not defined
                            */
                            data: publicaciones,
                            login: true,
                            nombre: req.session.nombre,
                            error:false
                        })
                    }
                })
            }
        });
    }else{
        res.render('chats',{
            login:false,
            nombre:'Debe iniciar sesión'
        });
    }

});

app.listen(app.get('port'), () =>{
    console.log('Server on port 3000');
    console.log(__dirname);
})