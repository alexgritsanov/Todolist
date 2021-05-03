//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const date = require(__dirname + "/date.js");

const app = express();
const _ = require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


// mongodb+srv://admin:*******@cluster0.z54bk.mongodb.net/todolistDB
mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
  name: String
}

const Item = mongoose.model("Item", itemsSchema);


const item1 = new Item ({
  name: "pen"
})

const item2 = new Item ({
  name: "table"
})

const item3 = new Item ({
  name: "ball"
})

const defaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

// Item.insertMany(defaultItems, function (err) {
//   if (err) {
//     console.log(err);}
//     else {console.log(" Items added successfully")}


// })


// Item.find({}, function(err, results){
//
//   if (results.length ===0) {
//     Item.insertMany(defaultItems, function (err) {
//       if (err) {
//         console.log(err);
//       } else {
//         console.log(" Items added successfully")}
//   }
//   if (err) {
//     console.log(err);
//
//   } else {



        app.get("/", function(req, res) {

        // const day = date.getDate();
        Item.find({}, function (err,results){

            if (results.length ===0 ){
              Item.insertMany(defaultItems,function(err){
                if (err) {
                  console.log(err);
                } else {
                  console.log("Succesfully added itmems");
                }
              });
              res.redirect("/");
            } else {
              res.render("list", {listTitle: "Today", newListItems: results});
            }

        });





    });




// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];



app.post("/", function(req, res){



  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  });

if (listName==="Today") {

  item.save();
  res.redirect("/");

} else {
  List.findOne({name:listName} , function(err,foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
  })
}
});

//
// item.save();
//   res.redirect("/");
//
//     Item.insertMany([itemName], function (err) {
//       if (err) {
//         console.log(err);}
//         else {console.log(" Items added successfully");
//           res.redirect("/");
//       }
//         })
//
//       });

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName==="Today") {

    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (err){
        console.log(err);
      }else {console.log("Succesfully deleted item")
        res.redirect("/")};
    })
  } else {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}, function(err,foundList){
      if (!err) {
        res.redirect("/" + listName);
      }
    });



}});

app.get("/:customListName", function(req,res){
  // console.log(req.params.customListName);
  const customListName = _.capitalize(req.params.customListName);


  List.findOne({name:customListName}, function(err, foundList){

      if (!err) {
        if (!foundList){
          //create a new list
          // console.log("Doesnt exist")
 const list = new List ({
   name:customListName,
   items: defaultItems
 })
          list.save();
          res.redirect("/" + customListName);
        } else {
          // show an exists list

          res.render("list", {listTitle: foundList.name, newListItems: foundList.items})

        };
      }
    });



  // list.save();
  // res.render("list", {listTitle: "Work List", newListItems: workItems});
});

//
// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
};

app.listen(3000, function() {
  console.log("Server has started successfully");
});
