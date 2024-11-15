-- Active: 1727263197809@@127.0.0.1@3306@stock
CREATE DATABASE stock;
USE stock;

CREATE Table user(
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE,
    name VARCHAR(100),
    isAdmin BOOLEAN DEFAULT FALSE,
    password VARCHAR(256)
);

CREATE Table stock(
    id INT PRIMARY KEY AUTO_INCREMENT,
    balanceHUF DOUBLE,
    stockName varchar(20),
    userid int,
    priceUSD DOUBLE,
    date DATETIME DEFAULT NOW(),
    USDHUF DOUBLE,
    stockAmount DOUBLE,
    Foreign Key (userid) REFERENCES user(id)
    on delete CASCADE
);
