//jshint esversion:6
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const mongoURI = process.env.MONGO_URI;

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(mongoURI);


// Define the items schema and model
const itemsSchema = new mongoose.Schema({
  name: String,
});
const Item = mongoose.model("Item", itemsSchema);

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema],
});

const List = mongoose.model("List", listSchema);

const item_1 = new Item({
  name: "Wlecome to your todolist",
});
const item_2 = new Item({
  name: "Hit the + button to add a new item",
});
const item_3 = new Item({
  name: "<-- Hit this to delet an item",
});
const defaultItem = [item_1, item_2, item_3];

// Item.insertMany(defaultItem)
//   .then((itemsResult) => {
//     console.log("Items inserted:", itemsResult);
//   })
//   .catch((err) => {
//     console.log("Error inserting items:", err);
//   });

app.get("/", function (req, res) {
  Item.find({})
    .then((items) => {
      // Check if items are empty
      if (items.length === 0) {
        // If the collection is empty, insert the default items
        Item.insertMany(defaultItem)
          .then((insertedItems) => {
            console.log("Inserted default items:", insertedItems);
            res.redirect("/"); // After inserting, redirect to root to render the new items
          })
          .catch((err) => {
            console.error("Error inserting default items:", err);
          });
      } else {
        // If items are not empty, render them
        res.render("list", { listTitle: "Today", newListItems: items });
      }
    })
    .catch((err) => {
      console.error("Error finding items:", err);
    });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const nameList = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (nameList === "Today") {
    item
      .save()
      .then((itemResult) => {
        console.log("item saved:", itemResult);
        res.redirect("/");
      })
      .catch((err) => {
        console.log("Error saving item:", err);
      });
  } else {
    List.findOne({ name: nameList })
      .then((findList) => {
        findList.items.push(item);
        findList
          .save()
          .then(() => {
            res.redirect("/" + nameList);
          })
          .catch((err) => {
            console.error("Error saving new list:", err);
          });
      })
      .catch((err) => {
        console.error("Error saving new list:", err);
      });
  }
});

// POST route to delete an item
// POST route to delete an item
app.post("/delete", function (req, res) {
  const itemId = req.body.checkbox;

  // Find the item by its ID and delete it
  Item.findByIdAndDelete(itemId)
    .then(() => {
      console.log("Successfully deleted item with id:", itemId);
      res.redirect("/"); // After deletion, redirect to the homepage
    })
    .catch((err) => {
      console.error("Error deleting item:", err);
    });
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName); // Use Lodash to handle the custom list name

  List.findOne({ name: customListName })
    .then((foundList) => {
      if (!foundList) {
        // Create a new list if it doesn't exist
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        return list.save().then(() => res.redirect("/" + customListName));
      } else {
        // If the list exists, render it
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    })
    .catch((err) => console.error("Error finding list:", err));
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
