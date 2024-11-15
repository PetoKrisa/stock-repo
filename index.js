const express = require("express")
const app = express()
var session = require('express-session')
var bodyParser = require('body-parser')
const ejs = require("ejs")
const {db} = require("./db")
const auth = require("./auth/middleware")
const stock = require("./stock/stockModel")
const user = require("./user/userModel")
const stockRouter = require("./stock/stockRouter")
    
require('dotenv').config()
const port = process.env.port

app.use("/public",express.static('public'))
app.set('trust proxy', 1)
app.use(session({
  secret: "process.env.secret",
  resave: true,
  saveUninitialized: true,
  cookie: {maxAge: 300000*3, httpOnly: false},
}))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.use("/", stockRouter)

app.get("/", auth.resetCookie, async (req,res)=>{
    let stocks;
    let users;

    if(auth.checkAdmin(req)){
        stocks = await stock.getAllStocks()
        users = await user.getAllUserNames()
    } else{
        stocks = await stock.getStocksOfUser(req.session.user.username)
        users = [{username: req.session.user.username}]
    }
    for(let i = 0; i < users.length; i++){
        users[i].deposit = await stock.getDepositOfUser(users[i].username)
        users[i].profit = await stock.getAllProfitOfUser(users[i].username)
        users[i].distribution = await stock.getDistributionOfUser(users[i].username)

    }
    betterDate = (date)=>{
        let d = new Date(date)
        return `${d.getFullYear()}.${d.getMonth()+1}.${d.getDate()}.`
    }
    betterDateTime = (date)=>{
        let d = new Date(date)
        return `${d.getFullYear()}.${d.getMonth()+1}.${d.getDate()}. ${d.getHours()}:${d.getMinutes()}`
    }
    res.render("index", {stocks: stocks, betterDate: betterDate, betterDateTime: betterDateTime, isAdmin: req.session.user.isAdmin, users: users})
})

app.get("/login", async (req,res)=>{
    let users = await user.getAllUserNames()
    res.render("login", {users: users})
})
app.post("/login", async (req,res)=>{
    try{
        let [rows,fields] = await db.query(`select * from user where username="${req.body.username}" and password="${req.body.password}"`)
        if(rows.length>0){
            req.session.resetMaxAge()
            req.session.user = {id: rows[0].id, username: rows[0].username, name: rows[0].name, isAdmin: Boolean(rows[0].isAdmin), isLoggedIn: true}
            let exp = new Date(req.session.cookie.expires)
            res.cookie("expire", exp.valueOf())
        }
    } catch (e){
        res.send("Bejelentkezés Sikertelen")
    }
    res.redirect("/")
})

app.get("/logout", (req,res)=>{
    req.session.destroy()
    res.redirect("/login")
})

app.listen(port,()=>{
    console.log(`Fut a szerver http://localhost:${port}`)
})

