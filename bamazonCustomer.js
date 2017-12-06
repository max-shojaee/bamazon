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

  console.log(colors.green("\n*********************** WELCOME TO BAMAZON **************************\n"));
  showInventory();
  setTimeout(nextAction, 500);
});


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
// makeTransaction() makes a transaction and updates inventory
//============================================================
function makeTransaction()
{
    inquirer.prompt([
    {
      name: "id",
      type: "input",
      message: "Enter the ID of the item to purchase: "
    },{
      name: "quantity",
      type: "input",
      message: "Enter the quantity to purchase: "
    }
    ]).then(function(answer) {

          var quantity = parseInt(answer.quantity);
          var id = parseInt(answer.id);

          // validate the item ID
          if (isNaN(id))
          {
            console.log(colors.red("\n Invalid item ID! Please try again."));
          }
          else if (id > maxItemID)
          {
            console.log(colors.red("\n Item ID could not be found! Please try again."));
          }
          // validate the quantity
          else if (isNaN(quantity))
          {
            console.log(colors.red("\n Invalid Quantity! Please try again."));
          }
          else
          {
             // search the database for the item with the given item ID
             connection.query("SELECT * FROM products WHERE ?", 
                {item_id: id}, function(err, results) {

                  if (results[0].stock_quantity < quantity)
                  {
                      console.log(colors.cyan("\n Sorry, we don't have the requested quantity in stock."));
                      console.log(colors.cyan(" Please adjust quantity or choose another item."));
                  }
                  else
                  {
                      console.log(colors.cyan("\n\n You requested to purchase " + quantity + " " 
                                  + results[0].product_name + "(s) at $" + results[0].price + " each"));
                          
                      var newQuantity = results[0].stock_quantity - quantity;
                      var total = quantity * results[0].price;

                      connection.query( "UPDATE products SET ? WHERE ?",
                                        [{stock_quantity: newQuantity},{item_id: id}],
                                function (err){
                                        if(err)throw err;
                                        console.log(colors.cyan(" Transaction complete, your total purchase is: $" + total));
                                });
                  }
           });
        }

        setTimeout(showInventory, 1000);
        setTimeout(nextAction, 2000);
    });    
}


//================================================================
// nextAction() prompts the user to continue or exit the app.
//================================================================
function nextAction()
{

    inquirer.prompt([{
      name: "continue",
      type: "list",
      message: "\n Would you like to make a purchase? \n",
      choices: ["YES", "NO"]
    }]).then(function(answer){
        if (answer.continue === "YES")
        {
           makeTransaction();
        } 
        else 
        {
           console.log(colors.cyan("Thank you for shopping at BAMAZON!"));
           connection.end();
           return;
        }
    });
}
