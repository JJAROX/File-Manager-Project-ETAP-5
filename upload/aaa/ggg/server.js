const express = require("express")
const app = express()
const PORT = 4000;
const bodyParser = require('body-parser')
const hbs = require('express-handlebars');
const path = require("path")
const Datastore = require('nedb')
const data = new Datastore({
  filename: 'auta.db',
  autoload: true
});
app.use(express.urlencoded({
  extended: true
}));
let context = {}
let title = {
  add: "add car page",
  list: "list car page",
  delete: "delete car page",
  edit: "edit/update page",
}
app.set('views', path.join(__dirname, 'views'))
app.engine('hbs', hbs({ defaultLayout: 'main.hbs' }));
app.set('view engine', 'hbs');
app.use(express.static('static'))
app.use('/css', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/css')))
app.listen(PORT, function () {
  console.log("start serwera na porcie " + PORT)
})
app.get("/", function (req, res) {
  res.render('index.hbs');
})
app.get("/carsList", function (req, res) {
  data.find({}).sort({ timestamp: 1 }).exec(function (err, context) {
    //zwracam dane w postaci JSON  
    /*console.log("----- tablica obiektów pobrana z bazy: \n")
    console.log(context)
    console.log("----- sformatowany z wcięciami obiekt JSON: \n")
    console.log(JSON.stringify({ "docsy": context }, null, 5))*/

    res.render('list.hbs', { title, context });
  });

})
app.get("/deleteCars", function (req, res) {
  data.find({}).sort({ timestamp: 1 }).exec(function (err, context) {
    //zwracam dane w postaci JSON  
    /*console.log("----- tablica obiektów pobrana z bazy: \n")
    console.log(context)
    console.log("----- sformatowany z wcięciami obiekt JSON: \n")
    console.log(JSON.stringify({ "docsy": context }, null, 5))*/
    res.render('delete.hbs', { title, context });
  });
})
app.get("/deleteAll", function (req, res) {
  let deletedNum = {}
  data.remove({}, { multi: true }, function (err, numRemoved) {
    console.log("usunięto dokumentów: ", numRemoved)
    deletedNum = numRemoved
    res.render('delete.hbs', { title, deletedNum });
  });

})
app.get("/deleteOne", function (req, res) {
  let deletedNum = {}
  data.remove({ _id: req.query._id }, { multi: true }, function (err, numRemoved) {
    console.log("usunięto dokumentów: ", numRemoved)
    deletedNum = numRemoved
    console.log(req.query);
    //res.render('delete.hbs', { title, numRemoved });
  });
  data.find({}).sort({ timestamp: 1 }).exec(function (err, context) {
    //zwracam dane w postaci JSON  
    /*console.log("----- tablica obiektów pobrana z bazy: \n")
    console.log(context)
    console.log("----- sformatowany z wcięciami obiekt JSON: \n")
    console.log(JSON.stringify({ "docsy": context }, null, 5))*/
    res.render('delete.hbs', { title, context, deletedNum });
  });

})
app.get("/deleteSelected", function (req, res) {
  data.remove({ _id: req.query._id }, { multi: true }, function (err, numRemoved) {
    console.log("usunięto dokumentów: ", numRemoved)
    res.render('delete.hbs', { title, numRemoved });
  });

})

app.get("/editCars", function (req, res) {
  data.find({}).sort({ timestamp: 1 }).exec(function (err, context) {
    //zwracam dane w postaci JSON  
    /*console.log("----- tablica obiektów pobrana z bazy: \n")
    console.log(context)
    console.log("----- sformatowany z wcięciami obiekt JSON: \n")
    console.log(JSON.stringify({ "docsy": context }, null, 5))*/

    res.render('edit.hbs', { title, context });;
  });

})


app.get("/addCar", function (req, res) {
  res.render('add.hbs', title)
})
app.post("/addCar", function (req, res) {
  let obj1 = {
    uszkodzony: req.body.uszkodzony == 'on' ? 'TAK' : 'NIE',
    ubezpieczony: req.body.ubezpieczony == 'on' ? 'TAK' : 'NIE',
    benzyna: req.body.benzyna == 'on' ? 'TAK' : 'NIE',
    naped: req.body.naped == 'on' ? 'TAK' : 'NIE',
    timestamp: new Date().getTime()
  }

  if (req.body.hidden == '1') {
    data.insert(obj1, function (err, newDoc) {
      /*console.log(newDoc)
      console.log(`Normlanie id tutej = ${newDoc._id}`);*/
      context = {
        id: `nowy samochód o id = ${newDoc._id} dodany do bazy danych`,
      }
      //console.log(context.id);
      res.render('add.hbs', { context, title });
    });
  } else { res.render('add.hbs', title); }


  console.log(req.query)

})
