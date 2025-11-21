// controllers/todo.controller.js (最終版本 - PostgreSQL)

// 載入資料庫連線池
const pool = require('../db');

// 1. 取得所有待辦事項 (Read All)
exports.getAllTodos = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM todos ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('取得所有事項錯誤:', err.message);
        // res.status(500).send({ message: '伺服器錯誤' });
        next(err);
    }
};

// 2. 取得單個待辦事項 (Read Single)
exports.getTodoById = async (req, res) => {
    // === 錯誤發生位置修正的關鍵 ===
    // 確保 ID 宣告在最頂部
    const id = parseInt(req.params.id); 
    
    // 檢查 ID 是否為有效數字，避免 SQL 錯誤
    if (isNaN(id)) {
        return res.status(400).send({ message: '無效的 ID 格式。' });
    }

    try {
        // 使用 $1 參數化查詢
        const result = await pool.query('SELECT * FROM todos WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            // 數據庫找不到，回傳 404
            return res.status(404).send({ message: `找不到 ID ${id} 的事項。` });
        }
        res.json(result.rows[0]);
    } catch (err) {
        // 捕獲並日誌記錄資料庫錯誤
        console.error('取得單個事項錯誤:', err.message);
        // res.status(500).send({ message: '伺服器錯誤' });
        next(err);
    }
};

// 3. 建立新的待辦事項 (Create)
exports.createTodo = async (req, res) => {
    const { title } = req.body;
    if (!title || title.trim() === '') {
        return res.status(400).send({ message: '標題 (title) 是必需的。' });
    }
    
    try {
        const result = await pool.query(
            'INSERT INTO todos (title, completed) VALUES ($1, FALSE) RETURNING *',
            [title]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('建立事項錯誤:', err.message);
        // res.status(500).send({ message: '伺服器錯誤' });
        next(err);
    }
};

// 4. 更新待辦事項 (Update)
exports.updateTodo = async (req, res) => {
    const id = parseInt(req.params.id);
    const { title, completed } = req.body;

    try {
        const result = await pool.query(
            'UPDATE todos SET title = COALESCE($1, title), completed = COALESCE($2, completed) WHERE id = $3 RETURNING *',
            [title, completed, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send({ message: `找不到 ID ${id} 的事項。` });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('更新事項錯誤:', err.message);
        // res.status(500).send({ message: '伺服器錯誤' });
        next(err);
    }
};

// 5. 刪除待辦事項 (Delete)
exports.deleteTodo = async (req, res) => {
    const id = parseInt(req.params.id);
    
    try {
        const result = await pool.query('DELETE FROM todos WHERE id = $1 RETURNING id', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).send({ message: `找不到 ID ${id} 的事項。` });
        }
        res.status(204).send({ message: `*** ID ${id}已刪除***` });
    } catch (err) {
        console.error('刪除事項錯誤:', err.message);
        // res.status(500).send({ message: '伺服器錯誤' });
        next(err);
    }
};