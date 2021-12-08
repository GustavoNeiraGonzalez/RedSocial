const controller = {};

controller.list = (req, res) =>{
    req.getConnection((err,conn) =>{
        conn.query('select * from publicacion', (err, publicaciones) =>{
            if (err){
                res.json(err)
            }
            else{
                console.log(publicaciones);
                res.render('muro', {
                    data: publicaciones
                })
            }
        })
    })
};

module.exports = controller;