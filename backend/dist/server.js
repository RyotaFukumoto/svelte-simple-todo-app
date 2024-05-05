"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
// 必要なモジュールをインポート
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const database_1 = require("./database");
// Serverクラスの定義
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.config();
        this.routes();
    }
    // サーバの設定
    config() {
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json());
        database_1.Database.connect(); // データベース接続の初期化
    }
    // APIエンドポイントの定義
    routes() {
        this.app.get('/tasks', (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const results = yield database_1.Database.query('SELECT * FROM tasks');
                res.json(results);
            }
            catch (err) {
                {
                    database_1.Database.handleDatabaseError(res, err);
                }
            }
        }));
        this.app.post('/tasks', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { title } = req.body;
            if (!title) {
                return res.status(400).send('Title is required');
            }
            try {
                const result = yield database_1.Database.query('INSERT INTO tasks (title) VALUES (?)', [title]);
                res.status(201).send({ id: result.insertId, title: title, completed: false });
            }
            catch (err) {
                database_1.Database.handleDatabaseError(res, err);
            }
        }));
        this.app.put('/tasks/:id', (req, res) => __awaiter(this, void 0, void 0, function* () {
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
                const result = yield database_1.Database.query(query, params);
                if (result.affectedRows === 0) {
                    return res.status(404).send('Task not found.');
                }
                res.send('Task updated successfully.');
            }
            catch (err) {
                database_1.Database.handleDatabaseError(res, err);
            }
        }));
        this.app.delete('/tasks/:id', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const result = yield database_1.Database.query('DELETE FROM tasks WHERE id = ?', [id]);
                if (result.affectedRows === 0) {
                    return res.status(404).send('Task not found.');
                }
                res.send('Task deleted successfully.');
            }
            catch (err) {
                database_1.Database.handleDatabaseError(res, err);
            }
        }));
    }
    // サーバの起動
    start() {
        const PORT = 3000;
        this.app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
}
exports.Server = Server;
