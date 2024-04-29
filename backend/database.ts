// 必要なモジュールをインポート
import mysql from 'mysql';
import dotenv from 'dotenv';
import express from 'express';

// 環境変数の設定を読み込む
dotenv.config();

// Databaseクラスの定義
export class Database {
    private static connection: mysql.Connection;

    // データベース接続を確立するメソッド
    public static connect(): void {
        Database.connection = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE
        });
    }

    // クエリを実行するためのメソッド
    public static query(sql: string, args?: any[]): Promise<any> {
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
    public static handleDatabaseError(res: express.Response, err: mysql.MysqlError): void {
        console.error(err);
        res.status(500).send('Database error occurred.');
    }
}
