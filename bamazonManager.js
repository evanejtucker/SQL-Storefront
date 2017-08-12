
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
  console.log("Bamazon: Manager View");
  managerActions();
});


function managerActions() {
  inquirer.prompt([
    {
      type: "list",
      name: "managerOptions",
      message: "What action would you like to preform?",
      choices: ["View products for sale",
                "View low inventory",
                "Add to inventory",
                "Add new product"]
    }
  ]).then(function (answers) {
    if (answers.managerOptions === "View products for sale") {
      viewProducts();  
    }
    if (answers.managerOptions === "View low inventory") {
      lowInventory();
    }
    if (answers.managerOptions === "Add to inventory") {
      addInventory();
    }
    if (answers.managerOptions === "Add new product") {
      addProduct();
    }
  });
}

function viewProducts() {
  console.log("these are all the products for sale...");
  connection.query("SELECT * FROM products", function(err, res) {
    for(i=0; i<res.length; i++) {
      console.log(res[i].product_name);
    }
    newAction();
  });
  
}

function lowInventory() {
  console.log("these are all the products with low inventory");
  connection.query("SELECT * FROM products WHERE stock_quantity < 10", function(err, res) {
    for(i=0; i<res.length; i++) {
      console.log(res[i].product_name + ": " + res[i].stock_quantity);
    }
    newAction();
  });
}

// will hold product that inventory is being added to.
var newInventory = [];

function addInventory() {
    console.log("adding inventory...");
    connection.query("SELECT * FROM products", function(err, res) {
      inquirer.prompt([
        {
          name: "items",
          type: "list",
          message: "What item would you like to add inventory to?",
          choices: function() {
                var choiceArray = [];
                for (var i = 0; i < res.length; i++) {
                  choiceArray.push(res[i].product_name);
                }
                return choiceArray;
              }
        }
      ]).then(function (answers) {
        var chosenItem;
          for (var i = 0; i < res.length; i++) {
            if (res[i].product_name === answers.items) {
              chosenItem = res[i];
            }
          }
        newInventory.push(chosenItem);
        instertInventory();
      });
    });
    
}

function instertInventory() {
  console.log("there are " + newInventory[0].stock_quantity + " " + newInventory[0].product_name + "'s left in stock.");
  inquirer.prompt([
    {
      type: "input",
      name: "invQuantity",
      message: "How much inventory would you like to add?"
    }
  ]).then(function (answers) {
    if(isNaN(answers.invQuantity)) {
      console.log("You must input a valid number.");
      insertInventory();
    } else {
      var newStock = parseInt(newInventory[0].stock_quantity) + parseInt(answers.invQuantity);
      connection.query("UPDATE products SET ? WHERE ?",
        [
          {
            stock_quantity: newStock
          },
          {
            id: newInventory[0].id
          }
        ],
          function(error) {
            if (error) throw err;
            console.log("Successfully added " + answers.invQuantity + " " + newInventory[0].product_name + "'s");
            newAction();
          }
        );
    }
  });

}

function addProduct() {
    console.log("adding new product...");
    inquirer.prompt([
      {
        name: "newProduct",
        type: "input",
        message: "What new product would you like to add to the store?"
      },
      {
        name: "department",
        type: "input",
        message: "What department will this new product be sold in?"
      },
      {
        name: "price",
        type: "input",
        message: "what is the price per unit of the new product",
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      },
      {
        name: "quantity",
        type: "input",
        message: "How many units of the new product should be stocked?",
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      },
      
    ])
    .then(function(answers) {
      // when finished prompting, insert a new item into the db with that info
      connection.query(
        "INSERT INTO products SET ?",
        {
          product_name: answers.newProduct,
          department_name: answers.department,
          price: answers.price,
          stock_quantity: answers.quantity
        },
        function(err) {
          if (err) throw err;
          console.log("New item added successfully!");
          newAction();
        }
      );
    });
}

function newAction() {
  newInventory = [];
  inquirer.prompt([
    {
      type: "confirm",
      name: "newManagerAction",
      message: "Would you like to perform another action?"
    },
  ]).then(function (answers) {
      if(answers.newManagerAction) {
        managerActions();
      } else {
        console.log("have a nice day!");
        connection.end();
      }
  });
}