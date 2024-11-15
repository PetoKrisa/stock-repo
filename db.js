const mysql = require("mysql2/promise")
require('dotenv').config()
const db = mysql.createPool({
    host: process.env.db_host,
    database: process.env.db_table,
    user:process.env.db_user,
    port: process.env.db_port
})

module.exports={db}