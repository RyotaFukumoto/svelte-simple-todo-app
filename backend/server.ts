// 必要なモジュールをインポート
import express from 'express';
import cors from 'cors';
import { Database } from './database';

// Serverクラスの定義
export class Server {
    private app: express.Application;

    constructor() {
        this.app = express();
        this.config();
        this.routes();
    }

    // サーバの設定
    private config(): void {
        this.app.use(cors());
        this.app.use(express.json());
        Database.connect();  // データベース接続の初期化
    }

    // APIエンドポイントの定義
    private routes(): void {
        this.app.get('/tasks', async (req, res) => {
            try {
                const results = await Database.query('SELECT * FROM tasks');
                res.json(results);
            } catch (err: any) {
                {
                    Database.handleDatabaseError(res, err);
                }
            }
        });

        this.app.post('/tasks', async (req, res) => {
            const { title } = req.body;
            if (!title) {
                return res.status(400).send('Title is required');
            }
            try {
                const result = await Database.query('INSERT INTO tasks (title) VALUES (?)', [title]);
                res.status(201).send({ id: result.insertId, title: title, completed: false });
            } catch (err: any) {
                Database.handleDatabaseError(res, err);
            }
        });

        this.app.put('/tasks/:id', async (req, res) => {
            const { completed, title } = req.body;
            const { id } = req.params;
            try {
                let query = 'UPDATE tasks SET';
                const params = [];
                const updates = [];

                if (completed !== undefined) {
                    updates.push('completed = ?');
                    params.push(completed);
                }
                if (title !== undefined) {
                    updates.push('title = ?');
                    params.push(title);
                }

                if (updates.length === 0) {
                    return res.status(400).send('No fields to update.');
                }

                query += ' ' + updates.join(', ') + ' WHERE id = ?';
                params.push(id);

                const result = await Database.query(query, params);
                if (result.affectedRows === 0) {
                    return res.status(404).send('Task not found.');
                }
                res.send('Task updated successfully.');
            } catch (err: any) {
                Database.handleDatabaseError(res, err);
            }
        });


        this.app.delete('/tasks/:id', async (req, res) => {
            const { id } = req.params;
            try {
                const result = await Database.query('DELETE FROM tasks WHERE id = ?', [id]);
                if (result.affectedRows === 0) {
                    return res.status(404).send('Task not found.');
                }
                res.send('Task deleted successfully.');
            } catch (err: any) {
                Database.handleDatabaseError(res, err);
            }
        });
    }

    // サーバの起動
    public start(): void {
        const PORT = 3000;
        this.app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
}
