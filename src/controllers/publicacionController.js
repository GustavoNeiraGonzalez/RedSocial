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
            console.log(publicaciones);
            res.redirect('/');
        });
    })
}
controller.save = (req, res) => {
    const data = req.body;

    req.getConnection((err, conn) => {
        conn.query('INSERT INTO publicacion set ?', [data], (err, publicaciones) => {
            console.log(publicaciones);
            res.redirect('/');
        });
    })
}
controller.delete = (req, res) => {
    req.getConnection((err, conn) => {
        const {id} = req.params;
        conn.query('DELETE FROM publicacion WHERE id = ?',[id], (err, rows) => {
            res.redirect('/');
        })

    })
}


module.exports = controller;