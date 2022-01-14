const express = require('express');
const path = require('path');
const morgan = require('morgan');
const mysql = require('mysql');
const myConnection = require('express-myconnection');
const nodemailer = require("nodemailer");


const app = express();
const dotenv = require('dotenv');
const http = require("http").Server(app);


const io = require('socket.io')(http)

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
                req.session.id = results[0].id;//por alguna razon da el id encryptado
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
                            id: req.session.id, //por alguna razon da el id encryptado, NO NECESITO EL ID DE MOMENTO EN MURO, LA SOLUCION LA TENGO EN LA PARTE DE CHAT
                            error:false
                        })     
                    }
                })
            }
        });
    }else{
        res.render('muro',{
            login:false,
            nombre:'Debe iniciar sesión',
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
                conn.query('Select id from usuarios where usuario = ?', [req.session.nombre], (err, Usuarioid) =>{
                    if (err){
                        res.json('error datos publicacion'+err)
                    }
                    else{
                        
                        conn.query('select * from publicacion', (err, publicaciones) =>{
                            if (err){
                                res.json('error datos publicacion'+err)
                            }
                            else{
                    
                                res.render('chats', {/* aqui evitamos que aparezca variable is not defined
                                    */
                                    data: publicaciones,
                                    login: true,
                                    nombre: req.session.nombre,
                                    idUsuario:Usuarioid,
                                    error:false
                                }) 
                            }
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

io.sockets.on("connection", function(socket) {

    console.log("conexion normal", socket.id)
    socket.on("username", function() {
      console.log("conexion username")
    });
  
    socket.on("disconnect", function() {
        console.log("conexion disconnect")
    });
  
    socket.on("chat_message",(data) => {
        console.log("conexion chat_messages")
        console.log(data);
        io.sockets.emit('Mensaje del servidor', data); 

        connection.query("insert into mensajes(id_mgrupo,mensajes) values(1,'"+data.message+"')",
        function (error, result) {
            if(error){
                console.log("error al insertar mensaje de chat al servidor: "+error)
            }else{
            }
        });
    });
    
    connection.query("select mens.mensajes from chat as ch inner join mensajegrupo as mg on ch.id_chat inner join mensajes as mens on mg.id_mgrupo=mens.id_mgrupo where ch.id_usuario=1 and ch.id_usuario_Amigo=2", (err, selectMensajes) =>{
        if (err){
            res.json(err)
        }
        else{
            io.sockets.emit('MostrarMensajesservidor', selectMensajes,console.log(selectMensajes)); 
        }
    })
    
    


});
  
const server = http.listen(3000,function(){
    console.log('Server working! asd localhost:3000');
});