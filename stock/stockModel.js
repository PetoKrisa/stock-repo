const mysql2 = require("mysql2")
const {db} = require("../db")
const auth = require("../auth/middleware")
const user = require("../user/userModel")
const { name } = require("ejs")

async function getStocksOfUser(username){
    let [rows] = await db.query("SELECT s.`id`, s.`balanceHUF`, s.`stockName`, u.`username`, s.`priceUSD`, s.`date`, s.`USDHUF`, s.`stockAmount` FROM stock s JOIN user u on s.userid = u.id where u.username=? order by s.date desc;",
        [username]
    )
    return rows
}

async function getAllStocks(){
    let [rows] = await db.query("SELECT s.`id`, s.`balanceHUF`, s.`stockName`, u.`username`, s.`priceUSD`, s.`date`, s.`USDHUF`, s.`stockAmount` FROM stock s JOIN user u on s.userid = u.id order by s.date desc;")
    return rows
}

async function getAllProfitOfUser(username){
    let [rows] = await db.query("SELECT SUM(s.balanceHUF) as profit from stock s JOIN user u ON s.userid=u.id WHERE u.username = ? AND s.stockName <> 'UTALÁS';",
        [username]
    )
    return rows[0].profit
}

async function getDepositOfUser(username) {
    let [transactions] = await db.query("SELECT s.balanceHUF from stock s JOIN user u ON s.userid=u.id WHERE u.username = ? AND s.stockName = 'UTALÁS' order by s.date asc;",
        [username]
    )
    
    let depositBalance = 0;

    for(let t of transactions){
        
        let amount = t.balanceHUF
        if(amount > 0){
            depositBalance += amount
        } else if( amount < 0){
            depositBalance += amount
            if(depositBalance<0){
                depositBalance = 0
            }
        }
    }

    return depositBalance
}

function betterDate(date){
    let newDate = new Date(date)
    let minuteZero = (newDate.getMinutes()<10) ? "0" : ""
    let hourZero = (newDate.getHours()<10) ? "0" : ""
    return `${newDate.getFullYear()}-${newDate.getMonth()+1}-${newDate.getDate()} ${hourZero}${newDate.getHours()}:${minuteZero}${newDate.getMinutes()}:00`
}

async function addStock(json){
    console.log(json)
    let userId = await user.getUserId(json.user)
    if(json.name == "UTALÁS"){
        let [utalasRows, utalasFields] = await db.query("insert into stock (`balanceHUF`, `stockName`, `userid`, `priceUSD`, `date`, `USDHUF`, `stockAmount`) values (?,?,?,?,?,?,?)"
            ,[parseFloat(json.balanceHUF), json.name, userId, null, betterDate(json.date),null,null]
        )
    } else if(json.balanceHUF != undefined){
        let amount = (json.balanceHUF*-1)/(json.priceUSD*json.USDHUF)
        let [balanceRows, balanceFields] = await db.query("insert into stock (`balanceHUF`, `stockName`, `userid`, `priceUSD`, `date`, `USDHUF`, `stockAmount`) values (?,?,?,?,?,?,?)"
            ,[parseFloat(json.balanceHUF), json.name, userId, parseFloat(json.priceUSD), betterDate(json.date), parseFloat(json.USDHUF), amount.toFixed(9)]
        )
    } else if(json.amount != undefined){
        let balanceHUF = Math.round(json.priceUSD*json.USDHUF*(json.amount*-1)) 
        let [balanceRows, balanceFields] = await db.query("insert into stock (`balanceHUF`, `stockName`, `userid`, `priceUSD`, `date`, `USDHUF`, `stockAmount`) values (?,?,?,?,?,?,?)"
            ,[balanceHUF, json.name, userId, parseFloat(json.priceUSD), betterDate(json.date), parseFloat(json.USDHUF),parseFloat(json.amount)]
        )
    }
}

async function deleteStock(id) {
    let [rows] = await db.query("delete from stock where stock.id=?", [parseInt(id)])
}

async function getDistributionOfUser(username) {
    let [rows] = await db.query(`
        WITH user_stock_totals AS (
            SELECT 
                userid,
                stockName,
                SUM(stockAmount) AS total_stocks,
                SUM(balanceHUF) AS total_value  -- Total value for each stock type
            FROM 
                stock
            GROUP BY 
                userid, 
                stockName
        ),
        user_portfolio_totals AS (
            SELECT 
                userid,
                SUM(total_value) AS portfolio_value  -- Total portfolio value for each user
            FROM 
                user_stock_totals
            WHERE 
                total_stocks > 0   -- Only include stocks the user still holds
            GROUP BY 
                userid
        )
        SELECT 
            un.username,
            u.stockName,
            u.total_stocks,
            u.total_value,
            p.portfolio_value,
            (u.total_value / p.portfolio_value) * 100 AS percentage_of_portfolio
        FROM 
            user_stock_totals u
        JOIN 
            user_portfolio_totals p 
        ON 
            u.userid = p.userid
        JOIN user un ON u.userid = un.id
        WHERE 
            u.total_stocks > 0 AND un.username=?;
        `, username)

    let output = []
    for(let i of rows){
        let temp = {
            stockName: i.stockName,
            percentage: i.percentage_of_portfolio.toFixed(2)
        }
        output.push(temp)
    }
    return output
}


module.exports = {getStocksOfUser, getAllStocks, getAllProfitOfUser, getAllProfitOfUser, getDepositOfUser, addStock, deleteStock,getDistributionOfUser}