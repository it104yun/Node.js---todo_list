// db.js

const { Pool } = require('pg');

// 設定資料庫連線參數：從 process.env 讀取變數
const pool = new Pool({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, // 這裡不再是 'mypassword'
});

/**
 * 建立 To-Do 表格 (如果不存在)
 */
const createTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS todos (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            completed BOOLEAN DEFAULT FALSE
        );
    `;
    try {
        await pool.query(query);
        console.log('✅PostgreSQL: todos 表格確認存在或已成功建立。');
    } catch (err) {
        console.error('❌ PostgreSQL: 建立表格時發生錯誤', err);
    }
};

// 在應用程式啟動時運行一次，確保表格存在
createTable();

// 匯出 pool 實例，供 Controller 使用
module.exports = pool;