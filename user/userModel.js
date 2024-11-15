const mysql2 = require("mysql2")
const {db} = require("../db")
const auth = require("../auth/middleware")

async function getAllUserNames(){
    let [rows] = await db.query("select username from user")
    return rows
}

async function getUserId(username) {
    let [rows] = await db.query("select id from user where username = ?", [username])
    return rows[0].id
}

module.exports = {getAllUserNames, getUserId}