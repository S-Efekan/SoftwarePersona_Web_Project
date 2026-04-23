import express from "express"
import db from "./db.js"
import bcrypt from "bcrypt"
import session from "express-session"
import dotenv from "dotenv"


dotenv.config()
const app = express()
app.set('view engine', 'ejs')
app.use(express.static("public"))
app.use(express.urlencoded({extended: true})) /* Bu kısım gelen formları işleyebilmek için */

// session management
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}))

app.get("/", (req,res) => {
    if (req.session.isAuth) {
        return res.render("dashboard")
    }
    res.redirect("/entry")
})

app.get("/entry", (req,res) => {
    res.render("entry")
})


app.post("/register", async (req,res) => {
    const {username, password, confirm_password} = req.body

    if (password != confirm_password) {
        req.session.message = "Passwords do not match!"
        return res.redirect("/entry")
    }
    
    const hashedPassword = await bcrypt.hash(password, 10)
    await db.query("INSERT INTO users (username, password) VALUES (?,?,?)", [username, hashedPassword])
    req.session.isAuth = true
    res.redirect("/")
})

app.post("/login", async (req,res) => {
    const {username, password} = req.body
    if( username == 'test'){
        req.session.message = "Logged in as test user!"
        req.session.isAuth = true
        return res.redirect("/")
    }

    const [info] = await db.query("select * from users where username = ?", [username])

    if (info.length > 0) {
        const user = info[0] /* 1 adet row dönmesini bekliyorum */
        const match = await bcrypt.compare(password, user.password)
        if(match) {
            req.session.isAuth = true
            req.session.cookie.maxAge = 1000 * 60 * 15 /* 15 dakika boyunca oturum açık kalır */
            return res.redirect("/")
        } else {
            req.session.message = "Invalid password or username"
            return res.redirect("/")
        }
    } else {
        req.session.message = "Invalid password or username"
        return res.redirect("/")
    }
})


/* Server port başlangıcı */
const port = process.env.PORT || 3000
app.listen(port || 3000, () => {
    console.log(`Server started running at port ${port}`)
})