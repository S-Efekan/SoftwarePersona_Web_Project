import express from "express"
import db from "../db.js"

const router = express.Router()

const isAuth = (req, res, next) => {
    if (req.session.isAuth) {
        next()
    } else {
        res.redirect("/entry")
    }
}

router.get("/dashboard", isAuth, async (req, res) => {
    const { search, status } = req.query
    let query = "SELECT * FROM notes WHERE user_id = ?"
    let params = [req.session.userId]

    if (search) {
        query += " AND (title LIKE ? OR category LIKE ?)"
        params.push(`%${search}%`, `%${search}%`)
    }

    if (status && status !== "Hepsi") {
        query += " AND status = ?"
        params.push(status)
    }

    query += " ORDER BY created_at DESC"
    
    const [notes] = await db.query(query, params)
    res.render("dashboard", { notes, search, status })
})

router.get("/new", isAuth, (req, res) => {
    res.render("add-note")
})

router.post("/add", isAuth, async (req, res) => {
    const { title, content, category, status } = req.body
    await db.query(
        "INSERT INTO notes (user_id, title, content, category, status) VALUES (?, ?, ?, ?, ?)",
        [req.session.userId, title, content, category, status]
    )
    res.redirect("/notes/dashboard")
})

router.get("/edit/:id", isAuth, async (req, res) => {
    const [note] = await db.query("SELECT * FROM notes WHERE id = ? AND user_id = ?", [req.params.id, req.session.userId])
    if (note.length > 0) {
        res.render("edit-note", { note: note[0] })
    } else {
        res.redirect("/notes/dashboard")
    }
})

router.post("/update/:id", isAuth, async (req, res) => {
    const { title, content, category, status } = req.body
    await db.query(
        "UPDATE notes SET title = ?, content = ?, category = ?, status = ? WHERE id = ? AND user_id = ?",
        [title, content, category, status, req.params.id, req.session.userId]
    )
    res.redirect("/notes/dashboard")
})

router.post("/delete/:id", isAuth, async (req, res) => {
    await db.query("DELETE FROM notes WHERE id = ? AND user_id = ?", [req.params.id, req.session.userId])
    res.redirect("/notes/dashboard")
})

export default router