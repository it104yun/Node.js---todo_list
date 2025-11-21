// script.js

const API_URL = 'http://localhost:3000/api/todos';

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const statusMessage = document.getElementById('status-message');


// --- 輔助函式：渲染列表 ---

function renderTodos(todos) {
    todoList.innerHTML = ''; // 清空現有列表

    if (todos.length === 0) {
        todoList.innerHTML = '<p class="status-message">目前沒有待辦事項！</p>';
        return;
    }

    todos.forEach(todo => {
        const listItem = document.createElement('li');
        listItem.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        listItem.setAttribute('data-id', todo.id);

        // 事項標題 (點擊切換完成狀態)
        const titleSpan = document.createElement('span');
        titleSpan.className = 'todo-title';
        titleSpan.textContent = todo.title;
        // titleSpan.addEventListener('click', () => toggleTodo(todo.id, todo.completed));
        
        // ❗ 新增：點擊標題後進入編輯模式
        titleSpan.addEventListener('click', () => {
            if (listItem.querySelector('input[type="text"]')) {
                return; // 如果已經是輸入框，則忽略點擊
            }
            enterEditMode(listItem, todo);
        });


        // 動作按鈕區
        const actionDiv = document.createElement('div');
        actionDiv.className = 'todo-actions';

        // 刪除按鈕
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        // deleteBtn.textContent = '❌';
        // ❗ 修改這行：使用 Font Awesome 圖示
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

        actionDiv.appendChild(deleteBtn);
        listItem.appendChild(titleSpan);
        listItem.appendChild(actionDiv);
        todoList.appendChild(listItem);
    });
}

// --- CRUD 函式：與後端 API 互動 ---

// 1. 讀取所有事項 (R)
async function fetchTodos() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('無法載入待辦事項。');
        }
        const todos = await response.json();
        renderTodos(todos);
    } catch (error) {
        statusMessage.textContent = `錯誤：${error.message}`;
        console.error('Fetch error:', error);
    }
}

// 2. 建立事項 (C)
async function createTodo(title) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title }),
        });

        if (response.status === 400) {
             // 處理後端驗證錯誤
            const errorData = await response.json();
            throw new Error(errorData.message);
        }

        if (!response.ok) {
            throw new Error('建立失敗。');
        }

        todoInput.value = ''; // 清空輸入框
        fetchTodos(); // 重新整理列表

    } catch (error) {
        statusMessage.textContent = `錯誤：${error.message}`;
        console.error('Create error:', error);
    }
}

// 3. 切換完成狀態 (U)
async function toggleTodo(id, currentCompleted) {
    const newCompleted = !currentCompleted;
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ completed: newCompleted }),
        });

        if (!response.ok) {
            throw new Error('更新狀態失敗。');
        }

        fetchTodos(); // 重新整理列表

    } catch (error) {
        statusMessage.textContent = `錯誤：${error.message}`;
        console.error('Toggle error:', error);
    }
}

// 4. 刪除事項 (D)
async function deleteTodo(id) {
    if (!confirm('確定要刪除這項待辦事項嗎？')) {
        return;
    }
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });

        if (response.status !== 204) { // 204 No Content 是成功的刪除響應
             throw new Error('刪除失敗。');
        }

        fetchTodos(); // 重新整理列表

    } catch (error) {
        statusMessage.textContent = `錯誤：${error.message}`;
        console.error('Delete error:', error);
    }
}

// script.js (新增這段)

// 5. 更新事項內容 (U - Inline Edit)
async function updateTodoTitle(id, newTitle) {
    // 檢查標題是否為空或少於3個字元（與後端驗證保持一致）
    if (!newTitle || newTitle.trim().length < 3) {
        statusMessage.textContent = '錯誤：標題長度必須至少為 3 個字元。';
        fetchTodos(); // 重新整理，恢復舊標題
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT', // 使用 PUT 方法更新資源
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title: newTitle }), // 只傳遞要更新的 title
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '更新標題失敗。');
        }

        statusMessage.textContent = '待辦事項已更新。';
        fetchTodos(); // 重新整理列表以確保資料一致

    } catch (error) {
        statusMessage.textContent = `錯誤：${error.message}`;
        console.error('Update title error:', error);
        fetchTodos(); // 發生錯誤時重新載入，避免 UI 錯亂
    }
}


// ------------未完成的待辨事項修改其內容--------------Begin
function enterEditMode(listItem, todo) {
    const titleSpan = listItem.querySelector('.todo-title');
    const originalTitle = todo.title;
    
    // 1. 建立輸入框
    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.className = 'edit-input';
    inputField.value = originalTitle;
    
    // 2. 替換標題
    listItem.replaceChild(inputField, titleSpan);
    inputField.focus(); // 讓輸入框自動獲得焦點
    
    // 3. 儲存/取消邏輯
    
    // 按下 Enter 鍵儲存
    inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const newTitle = inputField.value.trim();
            // 呼叫 API 更新函式
            updateTodoTitle(todo.id, newTitle);
        }
    });

    // 輸入框失去焦點時 (點擊其他地方)，取消編輯並恢復原狀
    inputField.addEventListener('blur', () => {
        // 恢復到 span 標籤
        listItem.replaceChild(titleSpan, inputField);
    });
}
// ------------未完成的待辨事項修改其內容--------------Ending


// --- 事件監聽器 ---
// 處理表單提交
todoForm.addEventListener('submit', (e) => {
    e.preventDefault(); // 阻止表單的預設提交行為 (頁面刷新)
    statusMessage.textContent = ''; // 清空狀態訊息
    const title = todoInput.value.trim();
    if (title) {
        createTodo(title);
    }
});


// --- 初始化 ---
document.addEventListener('DOMContentLoaded', fetchTodos);