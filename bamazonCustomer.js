//============================================================
// Dependencies
//============================================================
var mysql = require("mysql");
var inquirer = require("inquirer");
var colors = require('colors');

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
  showInvenory();
  setTimeout(makeTransaction, 500);
});


//============================================================
// showInventory() shows the current inventory 
//============================================================
function showInvenory()
{
  console.log("\n" + padString("ID", 22) + padString("Product Name", 36) 
              + padString("Department", 35) + padString("Price", 23) + padString("Quantity", 15));
  
  console.log(colors.green("====================================================================="));

  connection.query("SELECT * FROM products", function(err, results) {
      if (err) throw err;

      for (var i = 0; i < results.length; i++) 
      {
          console.log(colors.green("Id: " + padString(results[i].item_id, 10) + " | " + padString(results[i].product_name, 30) + " | "
              + padString(results[i].department_name, 30) + " | $" + padString(results[i].price, 15) + " | " + results[i].stock_quantity));
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
          connection.query("SELECT * FROM products WHERE ?", 
            { item_id: answer.id }, function(err, results) {
              if (results[0].stock_quantity < answer.quantity)
              {
                console.log(colors.cyan("\n Sorry, we don't have the requested quantity in stock."));
                console.log(colors.cyan(" Please adjust quantity or choose another item."));
              }
              else
              {
                console.log(colors.cyan("\n\n You requested to purchase " + answer.quantity + " " 
                            + results[0].product_name + "(s) at $" + results[0].price + " each"));
                    
                var newQuantity = results[0].stock_quantity - answer.quantity;
                var total = answer.quantity * results[0].price;

                connection.query( "UPDATE products SET ? WHERE ?",
                                  [{stock_quantity: newQuantity},{item_id: answer.id}],
                          function (err){
                                  if(err)throw err;
                                  console.log(colors.cyan(" Transaction complete, your total purchase is: $" + total));
                          });
              }

              setTimeout(showInvenory, 1000);
              setTimeout(nextAction, 2500);
        });
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
      message: "\n Would you like to make another purchase? \n",
      choices: ["YES", "NO"]
    }]).then(function(answer){
        if (answer.continue === "YES")
        {
           makeTransaction();
        } 
        else 
        {
           connection.end();
           return;
        }
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