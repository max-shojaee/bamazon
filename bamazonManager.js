//============================================================
// Dependencies
//============================================================
var mysql = require("mysql");
var inquirer = require("inquirer");
var colors = require('colors');

//============================================================
// Global Variables
//============================================================
var maxItemID = 0;

//============================================================
// Establish connection with MySQL server
//============================================================
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Tabestan_20",
    database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;

  console.log(colors.green("\n****************** WELCOME TO BAMAZON MANAGER VIEW *******************\n"));
  showInventory();
  setTimeout(displayMenu, 500);
});


//============================================================
// displayMenu() displays the main Menu
//============================================================
function displayMenu()
{
    inquirer.prompt([{
            name: "option",
            type: "list",
            message: "Please select an option:",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"]
    }]).then(function(answer) {
            switch (answer.option) {

                case "View Products for Sale":
                  showInventory();
                  setTimeout(displayMenu, 2000);
                  break;

                case "View Low Inventory":
                  showLowInventory();
                  break;

                case "Add to Inventory":
                  showInventory();
                  setTimeout(addToInventory, 500);
                  break;

                case "Add New Product":
                  addNewProduct();
                  break;

                case "Exit":
                  console.log(colors.cyan("\nThanks for uisng BAMAZON MANAGER VIEW!"));
                  connection.end();
                  return;

                default:
                  break;
            }
    });
}


//============================================================
// showInventory() shows the current inventory 
//============================================================
function showInventory()
{
  console.log("\n" + padString("ID", 22) + padString("Product Name", 51) 
              + padString("Department", 41) + padString("Price", 23) + padString("Quantity", 15));
  
  console.log(colors.green("===================================================================================="));

  connection.query("SELECT * FROM products", function(err, results) {
      if (err) throw err;

      for (var i = 0; i < results.length; i++) 
      {
          console.log(colors.green("Id: " + padString(results[i].item_id, 10) + " | " + padString(results[i].product_name, 45) + " | "
              + padString(results[i].department_name, 36) + " | $" + padString(results[i].price, 15) + " | " + results[i].stock_quantity));

           maxItemID = results[i].item_id;
      }

      console.log("\n");
  });
}


//============================================================
// showLowInventory() lists all items with an inventory count 
// lower than five.
//============================================================
function showLowInventory()
{
  console.log("\n" + padString("ID", 22) + padString("Product Name", 36) 
              + padString("Department", 35) + padString("Price", 23) + padString("Quantity", 15));
  
  console.log(colors.green("====================================================================="));

  connection.query("SELECT * FROM products WHERE stock_quantity < 5", function(err, results) {

      if (err) throw err;
      for (var i = 0; i < results.length; i++) 
      {
          console.log(colors.green("Id: " + padString(results[i].item_id, 10) + " | " + padString(results[i].product_name, 30) + " | "
              + padString(results[i].department_name, 30) + " | $" + padString(results[i].price, 15) + " | " + results[i].stock_quantity));
      }

      console.log("\n");
  });

  setTimeout(displayMenu, 2000);
}


//============================================================
// addToInventory() displays a prompt that will let the manager 
// "add more" of any item currently in the store.
//============================================================
function addToInventory()
{
    inquirer.prompt([
    {
      name: "id",
      type: "input",
      message: "Enter the ID of the item to add: "
    },{
      name: "quantity",
      type: "input",
      message: "Enter the quantity to add: "
    }
    ]).then(function(answer) {

          var id = parseInt(answer.id);
          var quantity = parseInt(answer.quantity);

          // validate the quantity
          if (isNaN(quantity))
          {
            console.log(colors.red("\n Invalid Quantity! Please try again."));
          }
          // validate the item ID
          else if (isNaN(id))
          {
            console.log(colors.red("\n Invalid item ID! Please try again."));
          }
          else if (id > maxItemID)
          {
            console.log(colors.red("\n Item ID could not be found! Please try again."));
          }
          else
          {
              // search the database for the item with the given item ID
              connection.query("SELECT * FROM products WHERE ?", {item_id: id }, function(err, results)
              {
                      console.log(colors.cyan("\n\n You requested to add " + quantity  
                                  + " " + results[0].product_name +"(s)"));

                      var newQuantity = results[0].stock_quantity + quantity;

                      connection.query( "UPDATE products SET ? WHERE ?",
                                      [{stock_quantity: newQuantity},{item_id: id}], function (err) {
                                      
                                      if(err)throw err;
                                    });
              });

          }
          setTimeout(showInventory, 500);
          setTimeout(displayMenu, 1000);
    });    
}


//============================================================
// addNewProduct() allows the manager to add a new product to 
// the store.
//============================================================
function addNewProduct()
{
    inquirer.prompt([
    {
        name: "product",
        type: "input",
        message: "Enter the product name: "
    },{
        name: "department",
        type: "input",
        message: "Enter the product department: "
    },{
        name: "price",
        type: "input",
        message: "Enter the price per item: "
    },{
        name: "quantity",
        type: "input",
        message: "Enter the quantity: "
    }
    ]).then(function(answer) {

         price_str = answer.price.replace("$", "");
         console.log(">>>>> split " + price_str);
         var price = parseFloat(price_str);
        console.log(">>>>> price " + price);


         var quantity = parseInt(answer.quantity);

          // validate the product name
          if (answer.product === "" || answer.product === " ")
          {
            console.log(colors.red("\n Invalid Product Name! Please try again."));
          }

          // validate the product department
          else if (answer.department === "" || answer.department === " ")
          {
            console.log(colors.red("\n Invalid Department! Please try again."));
          }
          // validate the price
          else if (isNaN(price))
          {
            console.log(colors.red("\n Invalid Price! Please try again."));
          }
          // validate the quantity
          else if (isNaN(quantity))
          {
            console.log(colors.red("\n Invalid Quantity! Please try again."));
          }
          else
          {
              // insert the new product in the database table
              connection.query("INSERT INTO products SET ?", {
                    product_name: answer.product,
                    department_name: answer.department,
                    price: price,
                    stock_quantity: quantity} , function(err, results)
                    {

              });
          }
          setTimeout(showInventory, 500);
          setTimeout(displayMenu, 1000);
    });    
}


//================================================================
// padString() pads a string with blanks up to the specified width. 
// If the item's length is larger than the width, the length of the 
// item will be truncated.
//================================================================
function padString(item, width)
{
    var str ="";
    str += item;

    if (str.length < width)
    {
      for (var i=str.length; i < width-str.length; i++)
        str += " ";
    }
    else 
    {
      str.length = width;
    }
    return str;
}