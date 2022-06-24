const postgre = require("pg").Pool;
const { Pool } = require("pg/lib");
require("dotenv").config();
//CREATE ROLE wachid29 WITH LOGIN PASSWORD 'pasword';

const connection = new Pool({
  user: process.env.user,
  host: process.env.host,
  database: process.env.database,
  password: process.env.password,
  port: process.env.port2,
});

// //export module biar bisa digunakan ditempat lain
module.exports = connection;
