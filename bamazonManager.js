//============================================================
// Dependencies
//============================================================
var util = require("./utility.js");
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
  console.log("\n" + util.padString("ID", 22) + util.padString("Product Name", 51) 
              + util.padString("Department", 41) + util.padString("Price", 23) + util.padString("Quantity", 15));
  
  console.log(colors.green("===================================================================================="));

  connection.query("SELECT * FROM products", function(err, results) {
      if (err) throw err;

      for (var i = 0; i < results.length; i++) 
      {
          console.log(colors.green("Id: " + util.padString(results[i].item_id, 10) + " | " + util.padString(results[i].product_name, 45) + " | "
              + util.padString(results[i].department_name, 36) + " | $" + util.padString(results[i].price, 15) + " | " + results[i].stock_quantity));

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
  console.log("\n" + util.padString("ID", 22) + util.padString("Product Name", 36) 
              + util.padString("Department", 35) + util.padString("Price", 23) + util.padString("Quantity", 15));
  
  console.log(colors.green("====================================================================="));

  connection.query("SELECT * FROM products WHERE stock_quantity < 5", function(err, results) {

      if (err) throw err;
      for (var i = 0; i < results.length; i++) 
      {
          console.log(colors.green("Id: " + util.padString(results[i].item_id, 10) + " | " + util.padString(results[i].product_name, 30) + " | "
              + util.padString(results[i].department_name, 30) + " | $" + util.padString(results[i].price, 15) + " | " + results[i].stock_quantity));
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
         var price = parseFloat(price_str);

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