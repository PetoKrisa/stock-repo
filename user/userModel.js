const mysql2 = require("mysql2")
const {db} = require("../db")
const auth = require("../auth/middleware")

async function getAllUserNames(){
    let [rows] = await db.query("select username, name from user")
    return rows
}

async function getUserId(username) {
    let [rows] = await db.query("select id from user where username = ?", [username])
    return rows[0].id
}
async function addUser(username, name, password) {
    let [rows] = await db.query("insert into user (username, name, password) values (?,?,?)", [username, name, password])
    console.log(rows.insertId)
    return rows.insertId
}

module.exports = {getAllUserNames, getUserId, addUser}