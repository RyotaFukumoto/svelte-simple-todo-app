import express from 'express';
import mysql from 'mysql';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());




// MySQLの設定でダメだったところを確認する




const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

// エラーハンドリング用の関数
const handleDatabaseError = (res: express.Response, err: mysql.MysqlError) => {
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
