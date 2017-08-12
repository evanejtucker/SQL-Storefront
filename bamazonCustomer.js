
var keys = require("./keys.js");

// requires npm packages.
var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: keys.sqlKeys.password,
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("Welcome to Bamazon!");
  listProducts();
});


// holds the user selected item to buy
// will need to be emptied after the transaction completes.
var itemToBuy = [];


// function to list all products in table, and give user option to pick which Item to buy.
function listProducts() {
  connection.query("SELECT * FROM products", function(err, res) {
    inquirer
      .prompt({
        name: "items",
        type: "list",
        message: "What item would you like to purchase?",
        choices: function() {
              var choiceArray = [];
              for (var i = 0; i < res.length; i++) {
                choiceArray.push(res[i].product_name);
              }
              return choiceArray;
            }
      })
      .then(function(answer) {
        // get the information of the chosen item
          var chosenItem;
          for (var i = 0; i < res.length; i++) {
            if (res[i].product_name === answer.items) {
              chosenItem = res[i];
            }
          }
          // sends the selected item to gobal array to be accesed by later functions.
          itemToBuy.push(chosenItem);
          console.log("So your looking to buy some " + itemToBuy[0].product_name + "'s,");
          console.log("It looks like we have " + itemToBuy[0].stock_quantity + " in stock.\n");
          purchaseQuantity();
      });
    });
}

function purchaseQuantity() {
    inquirer.prompt([
      {
        type: "input",
        name: "orderQuantity",
        message: "How many would you like to purchase?"
      }
    ]).then(function (answers) {
        // checks if user input is number
        if (isNaN(answers.orderQuantity)) {
          // is not a number
          console.log("You must select an order quantity");
          // runs function to allow user to select new order quantity.
          newOrderQuantity();
        } else {
          // checks to see if there is enough in stock
          if (answers.orderQuantity > itemToBuy[0].stock_quantity) {
            console.log("it doesnt look like we have enough in stock");
            // runs function to allow user to select new order quantity.
            newOrderQuantity();
          } else {
            console.log("It looks like we have enough in stock!");
            // calculated updated stock quantity.
            var updatedStock = itemToBuy[0].stock_quantity - answers.orderQuantity;
            // calculates total order price.
            var orderPrice = itemToBuy[0].price * answers.orderQuantity;

            // updates the database if the transaction is possible.
            connection.query(
              "UPDATE products SET ? WHERE ?",
              [
                {
                  stock_quantity: updatedStock
                },
                {
                  id: itemToBuy[0].id
                }
              ],
              function(error) {
                if (error) throw error;
                console.log("Your order of "+ answers.orderQuantity + " " + itemToBuy[0].product_name + "'s will cost $" + orderPrice + "\n");
                console.log("thanks for choosing bamazon!");
                // ends the node app
                connection.end();
              }
            );
          }
        } 
    });
}

function newOrderQuantity() {
  inquirer.prompt([
    {
      type: "confirm",
      name: "newQuantity",
      message: "Would you like to select a new order quantity?"
    },
  ]).then(function (answers) {
    if(answers.newQuantity) {
      purchaseQuantity();
    } else {
      console.log("have a nice day!");
      connection.end();
    }
    
  });
}