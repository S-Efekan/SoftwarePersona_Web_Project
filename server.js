import express from "express"
import db from "./db.js"
import bcrypt from "bcrypt"
import session from "express-session"
import dotenv from "dotenv"


dotenv.config()
const app = express()
app.set('view engine', 'ejs')
app.use(express.static("public"))

// session management
app.use(session({
    secret: process.env.SESSION_SECRET,
    reasave: false,
    saveUninitialized: true
}))

app.get("/", (req,res) => {
    if (req.session.isAuth) {
        return res.render("main")
    }
    res.redirect("/entry")
})

app.get("/main")

app.get("/entry", (req,res) => {
    res.render("entry")
})

const port = process.env.PORT || 3000

app.listen(port || 3000, () => {
    console.log(`Server started running at port ${port}`)
})