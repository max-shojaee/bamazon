DROP DATABASE IF EXISTS bamazon;
CREATE database bamazon;

USE bamazon;

CREATE TABLE products (
  item_id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(100) NULL,
  department_name VARCHAR(100) NULL,
  price DECIMAL(13,2) NULL,
  stock_quantity INT NOT NULL,
  PRIMARY KEY (item_id)
);

SELECT * FROM products;


insert into products (product_name, department_name, price, stock_quantity)
value ("Shirt", "Clothing", 40.00, 5);
insert into products (product_name, department_name, price, stock_quantity)
value ("Jeans", "Clothing", 45.00, 5);
insert into products (product_name, department_name, price, stock_quantity)
value ("Jacket", "Clothing", 65.00, 3);
insert into products (product_name, department_name, price, stock_quantity)
value ("Shoes", "Shoes", 60.00, 4);
insert into products (product_name, department_name, price, stock_quantity)
value ("Sneakers", "Shoes", 70.00, 5);
insert into products (product_name, department_name, price, stock_quantity)
value ("Laptop", "Electronics", 40.00, 5);
insert into products (product_name, department_name, price, stock_quantity)
value ("Lamp", "Furniture", 95.00, 3);
insert into products (product_name, department_name, price, stock_quantity)
value ("Desk", "Furniture", 300.00, 2);
insert into products (product_name, department_name, price, stock_quantity)
value ("Sheets", "Bedding", 85.00, 7);
insert into products (product_name, department_name, price, stock_quantity)
value ("Pillows", "Bedding", 35.00, 10);