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
  paths: [],
  fileRoot: null,
  fileContent: '',
  fileName: null
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
app.use(express.json())
app.engine('hbs', hbs({
  defaultLayout: 'main.hbs',
  helpers: {
    getIconPath: function (fileName) {
      const extension = fileName.split('.').pop()
      switch (extension.toLowerCase()) {
        case 'pdf':
          return '../images/pdf.png'
        case 'js':
          return '../images/javascript.png'
        case 'json':
          return '../images/json-file.png'
        case 'txt':
          return '../images/txt.png'
        case 'jpg':
          return '../images/jpg.png'
        case 'png':
          return '../images/png.png'
        case 'html':
          return '../images/html.png'
        default:
          return '../images/file.png'
      }
    },
    getNamePath: function (path) {
      const segments = path.split('//')
      return segments[segments.length - 1]
    },
    txtGraphFile: function (fileName) {
      const extension = fileName.split('.').pop()
      switch (extension.toLowerCase()) {
        case 'css':
          return '/showFile'
        case 'js':
          return '/showFile'
        case 'json':
          return '/showFile'
        case 'txt':
          return '/showFile'
        case 'jpg':
          return '/showImage'
        case 'png':
          return '/showImage'
        case 'html':
          return '/showFile'
        default:
          return '/showError'
      }
    }
  }
}));

app.use(express.static('static'))
app.use(express.static('upload'))
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
    // context.files.splice(0, context.files.length)
    // context.folders.splice(0, context.folders.length)
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
      // if (!context.root.includes('//')) {
      //   context.paths.push(context.root);
      // }
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
      // if (!context.root.includes('//')) {
      //   context.paths.push(context.root);
      // }
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

app.post('/changeFolderName', (req, res) => {
  const newPath = context.root.split('//')
  newPath[newPath.length - 1] = req.body.inputText
  const editedPath = newPath.join('//')
  console.log(editedPath);
  if (fs.existsSync(`${req.body.root}`)) {
    fs.rename(req.body.root, editedPath, (err) => {
      if (err) console.log(err)
      context = {
        paths: []
      }
      context.root = editedPath
      const editedPath2 = path.join(__dirname, editedPath)
      changePath(editedPath2, context)
      // if (!context.root.includes('//')) {
      //   context.paths.push(context.root);
      // }
      console.log(context);
      res.redirect('/')
    })
  }
})
app.post('/showFile', (req, res) => {
  context.fileRoot = `${req.body.root}`
  console.log(context.fileRoot);
  console.log(req.body);
  context.fileName = req.body.id
  fs.readFile(`${context.root}/${req.body.root}`, "utf-8", (err, data) => {
    if (err) throw err
    console.log(data.toString());
    context.fileContent = data.toString()
    res.render('showFile.hbs', context);
  })

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
app.post('/deleteFolder', (req, res) => {
  console.log(req.body);
  console.log(filepath);
  console.log(context);
  let root = context.root
  if (fs.existsSync(`${filepath}/${req.body.id}`)) {
    fs.rm(`${filepath}/${req.body.id}`, { recursive: true }, (err) => {
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
      // if (!context.root.includes('//')) {
      //   context.paths.push(context.root);
      // }
      filesFoldersPush(filepath, context)
      console.log(context);
      console.log(req.body.id);
      res.redirect('/');
    })
  }

})
app.post('/deleteFile', (req, res) => {
  console.log(req.body.id);
  let root = context.root
  if (fs.existsSync(`${filepath}/${req.body.id}`)) {
    fs.unlink(`${filepath}/${req.body.id}`, (err) => {
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
      // if (!context.root.includes('//')) {
      //   context.paths.push(context.root);
      // }
      filesFoldersPush(filepath, context)
      console.log(context);
    })

  }
  res.redirect('/');
})

app.post('/move', (req, res) => {
  console.log(req.body);
  context.root = `${context.root}/${req.body.root}`
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
app.post('/pathChange', (req, res) => {
  console.log(req.body.path);
  context.root = req.body.path
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
app.post('/showError', (req, res) => {
  res.render('showError.hbs');
})
app.post('/editFile', (req, res) => {
  console.log(req.body);
  fs.writeFile(`${filepath}/${req.body.id}`, `${req.body.areaContent}`, (err) => {
    if (err) throw err
    console.log("plik zapisany");
    res.redirect('/')
  })
})
app.post('/changeFileName', (req, res) => {
  console.log(req.body);
  if (fs.existsSync(`${req.body.root}`)) {
    fs.rename(`${req.body.root}${req.body.previousName}`, `${req.body.root}/${req.body.inputText}`, (err) => {
      if (err) console.log(err)
      changePath(filepath, context)
      console.log(context);
      res.redirect('/')
    })
  }
})
app.post('/viewFile', (req, res) => {
  if (fs.existsSync(`${req.body.root}${req.body.id}`)) {
    res.sendFile(`${filepath}${req.body.id}`)
  }
})
app.post('/fileSettings', (req, res) => {
  const data = req.body
  fs.writeFile('config.json', JSON.stringify(data), function (error) {
    if (error) {
      console.error(error);
      res.status(500).send("Bład podczas zapisu danych");
    } else {
      res.send("Zapisano pomyślnie");
    }
  });
})
app.get('/loadSettings', (req, res) => {
  fs.readFile('config.json', 'utf-8', function (error, data) {
    if (error) {
      console.error(error);
      res.status(500).send("Bład podczas zapisu danych");
    } else {
      res.header("content-type", "application/json")
      res.json(JSON.parse(data));
    }
  });
})
app.post("/showImage", (req, res) => {
  context.fileRoot = `${req.body.root}`
  console.log(context.fileRoot);
  console.log(req.body);
  context.fileName = req.body.id
  res.render('showImage.hbs', context);
})