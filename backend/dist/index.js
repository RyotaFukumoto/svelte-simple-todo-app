"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mysql_1 = __importDefault(require("mysql"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const db = mysql_1.default.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});
// エラーハンドリング用の関数
const handleDatabaseError = (res, err) => {
    console.error(err);
    res.status(500).send('Database error occurred.');
};
// GET /tasks - 全タスクの取得
app.get('/tasks', (req, res) => {
    db.query('SELECT * FROM tasks', (err, results) => {
        if (err) {
            return handleDatabaseError(res, err);
        }
        res.json(results);
    });
});
// POST /tasks - タスクの追加
app.post('/tasks', (req, res) => {
    const { title } = req.body;
    console.log('POST /tasks');
    console.log(req.body);
    console.log('@@@@@@@@@');
    if (!title) {
        return res.status(400).send('Title is required');
    }
    const query = 'INSERT INTO tasks (title) VALUES (?)';
    db.query(query, [title], (err, result) => {
        if (err) {
            console.error(err); // エラーログを出力
            return handleDatabaseError(res, err);
        }
        const insertId = result.insertId;
        res.status(201).send({ id: insertId, title: title, completed: false });
    });
});
// PUT /tasks/:id - タスクの更新
app.put('/tasks/:id', (req, res) => {
    const { completed } = req.body;
    const { id } = req.params;
    const query = 'UPDATE tasks SET completed = ? WHERE id = ?';
    db.query(query, [completed, id], (err, result) => {
        if (err) {
            return handleDatabaseError(res, err);
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Task not found.');
        }
        res.send('Task updated successfully.');
    });
});
// DELETE /tasks/:id - タスクの削除
app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM tasks WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            return handleDatabaseError(res, err);
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Task not found.');
        }
        res.send('Task deleted successfully.');
    });
});
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
