# SQL-storefront
The app will take in orders from customers and deplete stock from the store's inventory.

technologies used:
	SQL database,
	inquirer


bamazonCustomer: 
	running bamazonCustomer allows a user to view a list of all the products available from my products table, in my Bamazon database.
	
	steps:

		1) select a product to buy using the command prompt
		2) select an order quantity
			2a) if user input is not a number, an option to reslect an order quantity appears
			2b) if user input of order quantity is greater than the stock quantity of that product, a prompt to reselect quantity appears
		3) if order quantity is available, the total order price is given, and the application ends.
