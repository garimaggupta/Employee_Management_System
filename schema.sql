DROP DATABASE IF EXISTS employee_DB;
CREATE DATABASE employee_DB;

USE employee_DB;

CREATE TABLE department (
id INT NOT NULL AUTO_INCREMENT,
name VARCHAR(30),
primary key (id)
);

CREATE TABLE role (
id INT NOT NULL AUTO_INCREMENT,
title VARCHAR(30),
salary DECIMAL(12,2),
department_id INT not null,
primary key (id)
);

CREATE TABLE employee (
id INT NOT NULL AUTO_INCREMENT,
first_name VARCHAR(30) not null,
last_name VARCHAR(30) not null,
role_id int not null,
manager_id int,
primary key (id)
);

insert into department (name) values ("Sales");
insert into department (name) values ("Engineering");
insert into role (title,salary,department_id) values ("Sales Manager",100000.00,1);
insert into role (title,salary,department_id) values ("Development Lead",200000.00,2);
insert into employee (first_name,last_name,role_id) values ("Garima","Gupta",1);
insert into employee (first_name,last_name,role_id) values ("Ted","Baker",2,1);
insert into employee (first_name,last_name,role_id,manager_id) values ("Nick","Manon",2,2);
