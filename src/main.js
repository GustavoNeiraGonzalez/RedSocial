conn.query('Select * from usuarios where usuario = ?', [req.session.nombre], (err, Usuario) =>{
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
            idUsuario:Usuario.id+"asdasd",
            error:false
        })
    }
})
conn.query('Select * from usuarios where usuario = ?', [req.session.nombre], (err, Usuario) =>{
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
            idUsuario:Usuario.id+"asdasd",
            error:false
        })
    }
})