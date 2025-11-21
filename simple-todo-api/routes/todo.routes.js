// routes/todo.routes.js

const express = require('express');
const router = express.Router(); 
const todoController = require('../controllers/todo.controller'); 

// --- 所有路由定義 ---

// GET /api/todos - 取得所有待辦事項 (Read All)
router.get('/', todoController.getAllTodos);

// GET /api/todos/:id - 取得單個待辦事項 (Read Single)
router.get('/:id', todoController.getTodoById);

// POST /api/todos - 建立新的待辦事項 (Create)
router.post('/', todoController.createTodo);

// PUT /api/todos/:id - 更新待辦事項 (Update)
router.put('/:id', todoController.updateTodo);

// DELETE /api/todos/:id - 刪除待辦事項 (Delete)
router.delete('/:id', todoController.deleteTodo);


// 關鍵：匯出 router，供 server.js 使用
module.exports = router;