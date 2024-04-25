"use strict";
// TypeScriptやES6を使用する際の厳格モードを設定
// これにより、エラーを発生させる可能性のあるコードを記述することができる
// また、変数の宣言をvarからletやconstに変更することができる


// モジュールのデフォルトインポートを処理するためのヘルパー関数
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};

// このファイルがモジュールとしてエクスポートされることを定義
Object.defineProperty(exports, "__esModule", { value: true });

// 必要なモジュールをインポート
const express = __importDefault(require("express"));
const mysql = __importDefault(require("mysql"));
const dotenv = __importDefault(require("dotenv"));
const cors = __importDefault(require("cors"));

// 環境変数をロード
dotenv.default.config();

// Expressアプリケーションを初期化
const app = (0, express.default)();

// CORSポリシーを適用してAPIが他のドメインからのリクエストを受け入れるように設定
app.use((0, cors.default)());

// JSON形式のリクエストボディを解析するためのミドルウェアを適用
app.use(express.default.json());

// データベース接続を設定
const db = mysql.default.createConnection({
    host: process.env.DB_HOST,  // ホスト名
    user: process.env.DB_USER,  // ユーザ名
    password: process.env.DB_PASSWORD,  // パスワード
    database: process.env.DB_DATABASE  // データベース名
});

// データベースエラー時の処理関数
const handleDatabaseError = (res, err) => {
    // コンソールにエラーを出力
    console.error(err);
    // エラーレスポンスを送信
    res.status(500).send('Database error occurred.');
};


// GET /tasks - 全タスクの取得
app.get('/tasks', (req, res) => {
    // DBクエリの実行 (DBの責務: SQLクエリを用いてデータを取得)
    db.query('SELECT * FROM tasks', (err, results) => {
        if (err) {
            // データベースエラーのハンドリング (APIの責務: エラーレスポンスの送信)
            return handleDatabaseError(res, err);
        }
        // クエリ結果のレスポンス送信 (APIの責務: データをクライアントに返す)
        res.json(results);
    });
});

// POST /tasks - タスクの追加
app.post('/tasks', (req, res) => {
    const { title } = req.body;
    // 入力値のバリデーション (APIの責務: リクエストデータの検証)
    if (!title) {
        return res.status(400).send('Title is required');
    }
    // DBへのデータ挿入 (DBの責務: SQLクエリを用いてデータを挿入)
    const query = 'INSERT INTO tasks (title) VALUES (?)';
    db.query(query, [title], (err, result) => {
        if (err) {
            // データベースエラーのハンドリング (APIの責務: エラーレスポンスの送信)
            console.error(err);
            return handleDatabaseError(res, err);
        }
        // 挿入成功時のレスポンス (APIの責務: 成功レスポンスの送信)
        const insertId = result.insertId;
        res.status(201).send({ id: insertId, title: title, completed: false });
    });
});

// PUT /tasks/:id - タスクの更新
app.put('/tasks/:id', (req, res) =>{
     // リクエストから完了状態を取得
    const { completed } = req.body;
    // URLパラメータからタスクIDを取得
    const { id } = req.params;
    // SQLクエリ
    const query = 'UPDATE tasks SET completed = ? WHERE id = ?';
    // DB更新処理
    db.query(query, [completed, id], (err, result) => {
        if (err) {
            return handleDatabaseError(res, err);
        }
        if (result.affectedRows === 0)　{
            // タスクが見つからない場合
            return res.status(404).send('Task not found.');
        }
        // 更新成功レスポンス
        res.send('Task updated successfully.');
    });
});

// DELETE /tasks/:id - タスクの削除
app.delete('/tasks/:id', (req, res) => {
    // URLパラメータからタスクIDを取得
    const { id } = req.params;
    // SQLクエリ
    const query = 'DELETE FROM tasks WHERE id = ?';
    // DB削除処理
    db.query(query, [id], (err, result) => {
        if (err) {
            return handleDatabaseError(res, err);
        }
        if (result.affectedRows === 0) {
            // タスクが見つからない場合
            return res.status(404).send('Task not found.');
        }
        // 削除成功レスポンス
        res.send('Task deleted successfully.');
    });
});

// サーバーを指定ポートで起動
const PORT = 3000;
app.listen(PORT, () => {
     // サーバー起動ログ
    console.log(`Server is running on port ${PORT}`); 
});
