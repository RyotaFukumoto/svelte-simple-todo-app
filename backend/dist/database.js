"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
// 必要なモジュールをインポート
const mysql_1 = __importDefault(require("mysql"));
const dotenv_1 = __importDefault(require("dotenv"));
// 環境変数の設定を読み込む
dotenv_1.default.config();
// Databaseクラスの定義
class Database {
    // データベース接続を確立するメソッド
    static connect() {
        Database.connection = mysql_1.default.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE
        });
    }
    // クエリを実行するためのメソッド
    static query(sql, args) {
        return new Promise((resolve, reject) => {
            Database.connection.query(sql, args, (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results);
            });
        });
    }
    // エラーハンドリング用のメソッド
    static handleDatabaseError(res, err) {
        console.error(err);
        res.status(500).send('Database error occurred.');
    }
}
exports.Database = Database;
