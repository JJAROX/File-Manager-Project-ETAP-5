const express = require("express")
const app = express()
const PORT = 4000;
const formidable = require('formidable');
const bodyParser = require('body-parser')
const hbs = require('express-handlebars');
const path = require("path");
const { log } = require("console");
const titleContext = {
  upload: 'mutliupload',
  filemanager: 'filemanager',
  info: 'file info'
}

let mainArray = {};
let fileIdCounter = 1;

app.use(express.urlencoded({
  extended: true
}));

app.set('views', path.join(__dirname, 'views'))
app.engine('hbs', hbs({
  defaultLayout: 'main.hbs',
  extname: '.hbs',
  partialsDir: "views/partials",

}));
app.set('view engine', 'hbs');
app.use(express.static('static'))

app.listen(PORT, function () {
  console.log("start serwera na porcie " + PORT)
})

app.get("/", function (req, res) {
  res.render('upload.hbs', titleContext);
})

app.get("/filemanager", function (req, res) {
  res.render('filemanager.hbs', { titleContext, mainArray });
})

app.get("/info", function (req, res) {
  const id = parseInt(req.query.id);
  res.render('info.hbs', titleContext);
})

app.post('/filemanager', function (req, res) {
  let form = formidable({});
  form.keepExtensions = true;
  form.multiples = true;

  form.uploadDir = __dirname + '/upload/';

  form.parse(req, function (err, fields, files) {
    // console.log(form.bytesExpected, form.bytesReceived);
    //console.log("----- przesłane pola z formularza ------");
    // console.log(fields);

    // console.log("----- przesłane formularzem pliki ------");
    console.log(files);

    if (Array.isArray(files.imagetoupload)) {
      files.imagetoupload.forEach(file => {
        const fileId = fileIdCounter++;
        mainArray[fileId] = {
          id: fileId,
          img: file.type == 'image/jpeg' ? "/images/jpg.png" : file.type == 'image/png' ? "/images/png.png" : file.type == 'text/plain' ? "/images/txt.png" : file.type == 'application/pdf' ? "/images/pdf.png" : file.type == 'text/javascript' ? "/images/javascript.png" : file.type == 'application/json' ? "/images/json-file.png" : '/images/file.png',
          name: file.name,
          size: file.size,
          type: file.type,
          path: file.path,
          savedate: new Date().getTime()
        };

      });
    } else {
      const fileId = fileIdCounter++;
      mainArray[fileId] = {
        id: fileId,
        img: files.imagetoupload.type == 'image/jpeg' ? "/images/jpg.png" : files.imagetoupload.type == 'image/png' ? "/images/png.png" : files.imagetoupload.type == 'text/plain' ? "/images/txt.png" : files.imagetoupload.type == 'application/pdf' ? "/images/pdf.png" : files.imagetoupload.type == 'text/javascript' ? "/images/javascript.png" : files.imagetoupload.type == 'application/json' ? "/images/json-file.png" : '/images/file.png',
        name: files.imagetoupload.name,
        size: files.imagetoupload.size,
        type: files.imagetoupload.type,
        path: files.imagetoupload.path,
        savedate: new Date().getTime()
      };

    }
    res.render('filemanager.hbs', { titleContext, mainArray });
    //console.log(mainArray);
  });



});
app.get('/show', function (req, res) {
  const fileIdToShow = parseInt(req.query.id);
  if (mainArray[fileIdToShow]) {
    const filePathToShow = mainArray[fileIdToShow].path;
    res.sendFile(filePathToShow);
    return;
  } else {
    res.send(`Plik z ID ${fileIdToShow} nie istnieje`);
  }
})
app.get('/download', function (req, res) {
  const fileIdToShow = parseInt(req.query.id);
  if (mainArray[fileIdToShow]) {
    const filePathToShow = mainArray[fileIdToShow].path;
    res.download(filePathToShow);
    return;
  } else {
    res.send(`Plik z ID ${fileIdToShow} nie istnieje`);
  }
})
app.post('/info', function (req, res) {
  const fileIdToShow = parseInt(req.body.id);
  console.log(mainArray[fileIdToShow].id);
  if (mainArray[fileIdToShow]) {
    const fileData = mainArray[fileIdToShow];
    res.render('info.hbs', { titleContext, info: fileData });

  } else {
    res.send(`Plik z ID ${fileIdToShow} nie istnieje`);
  }

})
app.get('/delete', function (req, res) {
  const fileIdToDelete = parseInt(req.query.id);

  if (mainArray[fileIdToDelete]) {
    delete mainArray[fileIdToDelete];
    res.redirect('/filemanager');
  } else {
    res.send(`Plik z ID ${fileIdToDelete} nie istnieje`);
  }
});
app.get('/delete-all', function (req, res) {
  mainArray = {};
  res.redirect('/filemanager');
});