const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ =require("lodash");
require("dotenv").config();
console.log(process.env);

const url = process.env.MONGODB_URL;

mongoose.connect(url);

const day = date.getDate();

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const itemsSchema = {
  name:String
};

const listSchema = {
  name: String,
  items : [itemsSchema]
};

const Item = mongoose.model("Item",itemsSchema);
const List = mongoose.model("List",listSchema);

const item1 = new Item({
  name:"Welcome to your todolist!"
});
const item2 = new Item({
  name:"Hit the + button to add a new item"
});
const item3 = new Item({
  name:"Tick the checkbox to delete an item"
});

const defaultItems=[item1,item2,item3];


app.get("/", function(req, res) {



  Item.find(function(err,foundItems){

    if(foundItems.length === 0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Sucessfully Inserted");
        }
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: day, newListItems: foundItems});
    }
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item= new Item({
    name: itemName
  });

  if(listName===day){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }



});

app.post("/delete",function(req,res){

  const listName=req.body.listName;

  if(listName===day){
    Item.findByIdAndRemove(req.body.checkbox,function(err){});
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id:req.body.checkbox }}},function(err){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }

});

app.get("/:customListName", function(req,res){

  const customListName=_.capitalize(req.params.customListName);

  List.findOne({name: customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: customListName,
          items : defaultItems
        });

        list.save();
        res.redirect("/"+customListName);
      }else{
        res.render("list",{listTitle: customListName,newListItems: foundList.items});
      }
    }

  })

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started!!");
});
