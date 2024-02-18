const express = require("express")
const app = express()
const PORT = 5000;
const formidable = require('formidable');
const bodyParser = require('body-parser')
const hbs = require('express-handlebars');
const fs = require("fs")
const path = require("path");
const { log } = require("console");
let context = {
  files: [],
  folders: [],
  root: 'upload',
  paths: []
}



function changePath(filepath, context) {
  fs.readdir(filepath, (err, files) => {
    if (err) throw err
    context.folders = []
    context.files = []
    files.forEach((file) => {
      const fullPath = path.join(filepath, file)
      fs.lstat(fullPath, (err, stats) => {
        // console.log(file, stats.isDirectory())
        if (stats.isDirectory()) {

          context.folders.push(file)
        } else {

          context.files.push(file)
        }
        console.log(context)
      })
    })
  })
}

function filesFoldersPush(filepath, context) {
  fs.readdir(filepath, (err, files) => {
    if (err) throw err
    files.forEach((file) => {
      const fullPath = path.join(filepath, file)
      fs.lstat(fullPath, (err, stats) => {
        console.log(file, stats.isDirectory())
        if (stats.isDirectory()) {
          context.folders.push(file)
        } else {
          context.files.push(file)
        }
        console.log(context)
      })
    })
  })
}

let filepath = path.join(__dirname, context.root || "upload")
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

app.engine('hbs', hbs({
  defaultLayout: 'main.hbs',
  helpers: {
    getIconPath: function (fileName) {
      const extension = fileName.split('.').pop();
      switch (extension.toLowerCase()) {
        case 'pdf':
          return '../images/pdf.png';
        case 'js':
          return '../images/javascript.png';
        case 'json':
          return '../images/json-file.png';
        case 'txt':
          return '../images/txt.png';
        case 'jpg':
          return '../images/jpg.png';
        case 'png':
          return '../images/png.png';
        default:
          return '../images/file.png';
      }
    },
    getNamePath: function (path) {
      const segments = path.split('//');
      return segments[segments.length - 1];
    }
  }
}));

app.use(express.static('static'))

app.listen(PORT, function () {
  console.log("start serwera na porcie " + PORT)
})
fs.readdir(filepath, (err, files) => {
  if (err) throw err
  console.log("lista", files);
})
fs.readdir(filepath, (err, files) => {
  if (err) throw err
  files.forEach((file) => {
    const fullPath = path.join(filepath, file)
    fs.lstat(fullPath, (err, stats) => {
      console.log(file, stats.isDirectory())
      if (stats.isDirectory()) {
        context.folders.push(file)
      } else {
        context.files.push(file)
      }
      console.log(context)
    })
  })
})
app.get("/", function (req, res) {
  if (!fs.existsSync(filepath)) {
    context.files.splice(0, context.files.length)
    context.folders.splice(0, context.folders.length)
    const rootSegments = context.root.split('//');
    let currentPath = '';
    rootSegments.forEach((segment) => {
      currentPath = currentPath ? `${currentPath}//${segment}` : segment;
      if (currentPath !== 'upload') {
        context.paths.push(currentPath);
      }
    });
    if (!context.root.includes('//')) {
      context.paths.push(context.root);
    }
    context.Message = null
  } else {

  }

  console.log(context);
  res.render('index.hbs', context);
})

app.post("/savefile", (req, res) => {
  if (!fs.existsSync(`${req.body.root}/${req.body.inputText}`)) {
    fs.appendFile(path.join(__dirname, `${req.body.root}`, req.body.inputText), "", (err) => {
      if (err) throw err
      console.log("plik utworzony");
      context.files.push(req.body.inputText)
      console.log(context);
    })
    fs.readdir(filepath, (err, files) => {
      if (err) throw err
      context.folders = []
      context.files = []
      context.paths = []
      const rootSegments = context.root.split('//');
      let currentPath = '';
      rootSegments.forEach((segment) => {
        currentPath = currentPath ? `${currentPath}//${segment}` : segment;
        if (currentPath !== 'upload') {
          context.paths.push(currentPath);
        }
      });
      if (!context.root.includes('//')) {
        context.paths.push(context.root);
      }
      files.forEach((file) => {
        const fullPath = path.join(filepath, file)
        fs.lstat(fullPath, (err, stats) => {
          console.log(file, stats.isDirectory())
          if (stats.isDirectory()) {
            context.folders.push(file)
          } else {
            context.files.push(file)
          }
          console.log(context)
        })
      })
    })
    console.log(context);
    context.Message = null
    res.redirect('/');
  } else {
    context.Message = 'This file already exists'
    res.redirect('/');
  }

})
app.post("/savefolder", (req, res) => {
  if (!fs.existsSync(`${req.body.root}/${req.body.inputText}`)) {
    fs.mkdir(`${req.body.root}/${req.body.inputText}`, (err) => {
      if (err) throw err
      console.log("jest");
    })
    console.log(req.body.inputText);
    fs.readdir(filepath, (err, files) => {
      if (err) throw err
      context.files = []
      context.folders = []
      context.paths = []
      const rootSegments = context.root.split('//');
      let currentPath = '';
      rootSegments.forEach((segment) => {
        currentPath = currentPath ? `${currentPath}//${segment}` : segment;
        if (currentPath !== 'upload') {
          context.paths.push(currentPath);
        }
      });
      if (!context.root.includes('//')) {
        context.paths.push(context.root);
      }
      files.forEach((file) => {
        const fullPath = path.join(filepath, file)
        fs.lstat(fullPath, (err, stats) => {
          console.log(file, stats.isDirectory())
          if (stats.isDirectory()) {
            context.folders.push(file)
          } else {
            context.files.push(file)
          }
          console.log(context)
        })
      })
    })
    console.log(context)
    context.Message = null
    res.redirect('/');
  } else {
    context.Message = 'This folder already exists'
    res.redirect('/');
  }


})
app.post('/upload', (req, res) => {
  let form = formidable({});
  form.keepExtensions = true;
  form.multiples = true;
  form.uploadDir = __dirname + `/${context.root}/`;

  form.on('fileBegin', function (name, file) {
    file.path = form.uploadDir + "/" + file.name;
  })
  form.parse(req, function (err, fields, files) {

    console.log("----- przesłane pola z formularza ------");

    console.log(fields);

    console.log("----- przesłane formularzem pliki ------");

    if (Array.isArray(files.inputfile)) {
      files.inputfile.forEach(file => {
        console.log(file.name);
        context.files.push(file.name)
        console.log(context);
      })
    }
    else {
      console.log(files.inputfile.name);
      context.files.push(files.inputfile.name)
      console.log(context);
    }
  });
  fs.readdir(filepath, (err, files) => {
    if (err) throw err
    console.log("lista", files);
    console.log(context);
  })
  console.log(context)
  res.redirect('/');
})
app.get('/deleteFolder', (req, res) => {
  console.log(req.query);
  console.log(filepath);
  console.log(context);
  let root = context.root
  if (fs.existsSync(`${filepath}/${req.query.id}`)) {
    fs.rmdir(`${filepath}/${req.query.id}`, (err) => {
      if (err) throw err
      console.log("czas 1: " + new Date().getMilliseconds());
      context = {
        files: [],
        folders: [],
        paths: []
      }
      context.root = root
      const rootSegments = context.root.split('//');
      let currentPath = '';
      rootSegments.forEach((segment) => {
        currentPath = currentPath ? `${currentPath}//${segment}` : segment;
        if (currentPath !== 'upload') {
          context.paths.push(currentPath);
        }
      });
      if (!context.root.includes('//')) {
        context.paths.push(context.root);
      }
      filesFoldersPush(filepath, context)
      console.log(context);
      console.log(req.query.id);
    })
  } else {
    console.log('ŁOT');
  }
  res.redirect('/');
})
app.get('/deleteFile', (req, res) => {
  console.log(req.query.id);
  let root = context.root
  if (fs.existsSync(`${filepath}/${req.query.id}`)) {
    fs.unlink(`${filepath}/${req.query.id}`, (err) => {
      if (err) throw err
      console.log("czas 1: " + new Date().getMilliseconds());
      context = {
        files: [],
        folders: [],
        paths: []
      }
      context.root = root
      const rootSegments = context.root.split('//');
      let currentPath = '';
      rootSegments.forEach((segment) => {
        currentPath = currentPath ? `${currentPath}//${segment}` : segment;
        if (currentPath !== 'upload') {
          context.paths.push(currentPath);
        }
      });
      if (!context.root.includes('//')) {
        context.paths.push(context.root);
      }
      filesFoldersPush(filepath, context)
      console.log(context);
    })

  } else {
    console.log('ŁOT');
  }
  res.redirect('/');
})

app.get('/move', (req, res) => {
  console.log(req.query);
  context.root = `${context.root}/${req.query.root}`
  filepath = path.join(__dirname, `${context.root}`)
  context.paths = []
  const rootSegments = context.root.split('//');
  let currentPath = '';
  rootSegments.forEach((segment) => {
    currentPath = currentPath ? `${currentPath}//${segment}` : segment;
    if (currentPath !== 'upload') {
      context.paths.push(currentPath);
    }
  });
  if (!context.root.includes('//')) {
    context.paths.push(context.root);
  }
  changePath(filepath, context)
  res.redirect('/')
})
app.get('/moveHome', (req, res) => {
  context.paths = []
  filepath = path.join(__dirname, `upload`)
  context.root = 'upload'
  changePath(filepath, context)
  res.redirect('/')
})
app.get('/pathChange', (req, res) => {
  console.log(req.query.path);
  context.root = req.query.path
  context.paths = []
  const rootSegments = context.root.split('//');
  let currentPath = '';
  rootSegments.forEach((segment) => {
    currentPath = currentPath ? `${currentPath}//${segment}` : segment;
    if (currentPath !== 'upload') {
      context.paths.push(currentPath);
    }
  });
  if (!context.root.includes('//')) {
    context.paths.push(context.root);
  }
  filepath = path.join(__dirname, `${context.root}`)
  changePath(filepath, context)
  res.redirect('/')
})