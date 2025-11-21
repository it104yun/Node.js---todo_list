// ❗ 必須是第一行：載入 .env 檔案中的變數到 process.env
require('dotenv').config();

const express = require('express');
const cors = require('cors'); // 載入 CORS : 英文是 Cross-Origin Resource Sharing，中文為「跨來源資源共用」
const app = express();
// 從環境變數中讀取 PORT，如果 .env 中沒有設定，則使用預設值 3000
const PORT = process.env.PORT || 3000;

require('./db');     //載入資料庫連線，並觸發表格建立函式

// ❗ 關鍵：在所有路由之前使用 cors 中間件
// 允許所有來源 (簡單快速，開發時適用)
app.use(cors());

// 1. 載入路由模組
const todoRoutes = require('./routes/todo.routes');

// 2. 中間件: JSON 解析
app.use(express.json());

// 3. 將路由模組「掛載」到 /api/todos 路徑上
// 這裡定義了路由的前綴：所有在 todoRoutes 裡的路徑都會以 /api/todos 開頭
app.use('/api/todos', todoRoutes); 

// 基礎路由 (可選)
app.get('/', (req, res) => {
    res.send('API 伺服器運行中。請訪問 /api/todos。');
});


// --- 錯誤處理中間件 ---

// (1). 處理 404 錯誤 (找不到路由)，當所有路由都匹配失敗時，執行這個中間件
app.use((req, res, next) => {
    // 建立一個 Error 物件，設定狀態碼為 404
    const error = new Error(`找不到路徑：${req.originalUrl}`);
    error.status = 404;
    // 將這個 Error 物件傳遞給下一個錯誤處理器 (步驟 2)
    next(error); 
});


// (2). 集中處理錯誤 (最終的 500/404 響應)，Express 透過四個參數 (err, req, res, next) 識別錯誤處理器
app.use((err, req, res, next) => {
    // 如果錯誤沒有狀態碼 (status)，預設為 500
    const status = err.status || 500;
    
    // 將錯誤訊息列印到終端機 (供開發者查看)
    console.error(`❌ ${status} 錯誤：`, err.message);

    // 回應客戶端
    res.status(status).json({
        success: false,
        message: err.message || '伺服器發生未預期的錯誤',
        // 在生產環境中，通常會隱藏 stack trace，但在開發階段可以保留
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

// 4. 啟動伺服器
app.listen(PORT, () => {
    // 使用 ${PORT} 變數
    console.log(`✅ 伺服器已啟動，正在 http://localhost:${PORT} 上運行`);
    console.log(`API 終點：http://localhost:${PORT}/api/todos`);
});