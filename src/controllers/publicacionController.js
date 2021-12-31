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


controller.save = (req, res) => {
    const data = req.body;
    
    req.getConnection((err, conn) => {
        conn.query('INSERT INTO publicacion set ?', [data], (err, publicaciones) => {
            if (err) throw err
            console.log(publicaciones);
            res.redirect('/');
        });
    })
}

controller.update = (req, res) =>{
    const {id} = req.params;
    const NewPublic = req.body;
    req.getConnection((err, conn) => {
        conn.query('update publicacion set ? where id = ?', [NewPublic, id], (err, rows) =>{
            if (err) throw err
            console.log(rows);
            res.redirect('/');
        });
    })
}
controller.delete = (req, res) => {
    const {id} = req.params;

    req.getConnection((err, conn) => {
        conn.query('DELETE FROM publicacion WHERE id = ?',[id], (err, rows) => {
            res.redirect('/');
        })

    })
}


module.exports = controller;