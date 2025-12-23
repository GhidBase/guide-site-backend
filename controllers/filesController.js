async function test(req, res) {
    console.log({
        title: req.file.originalname,
        url: req.file.path,
        filename: req.file.filename,
        // folderId: +req.body.id,
    });
    res.send({
        title: req.file.originalname,
        url: req.file.path,
        filename: req.file.filename,
        // folderId: +req.body.id,
    });
}

export default { test };
