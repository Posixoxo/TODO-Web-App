// ========== THEME TOGGLE ==========
const themeToggle = document.querySelector('.theme-toggle');
const body = document.body;

// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
  body.classList.add('light-theme');
}

themeToggle.addEventListener('click', () => {
  body.classList.toggle('light-theme');
  // Save theme preference
  const theme = body.classList.contains('light-theme') ? 'light' : 'dark';
  localStorage.setItem('theme', theme);
});

// ========== TODO APP LOGIC ==========
const todoInput = document.getElementById('todo-input');
const todoList = document.querySelector('.todo-list');
const itemsLeftElements = document.querySelectorAll('.items-left');
const clearCompletedBtns = document.querySelectorAll('.clear-completed');

let todos = [];
let currentFilter = 'All';
let draggedElement = null;

// Initialize app
function init() {
  loadTodos();
  setupEventListeners();
  renderTodos();
  updateItemsLeft();
  // Update filter buttons
  requestAnimationFrame(() => {
    updateFilterButtons();
  });
}

// Update filter buttons to show active state
function updateFilterButtons() {
  const allFilterBtns = document.querySelectorAll('.filter');
  
  allFilterBtns.forEach(btn => {
    const btnText = btn.textContent.trim();
    btn.classList.remove('active');
    
    if (btnText === currentFilter) {
      btn.classList.add('active');
      btn.style.color = 'hsl(220, 98%, 61%)';
    } else {
      btn.style.color = '';
    }
  });
}

// Load todos from localStorage or existing HTML
function loadTodos() {
  const savedTodos = localStorage.getItem('todos');
  
  if (savedTodos) {
    todos = JSON.parse(savedTodos);
  } else {
    const existingContainers = document.querySelectorAll('.todo-container');
    existingContainers.forEach(container => {
      const text = container.querySelector('.todo-text').textContent;
      todos.push({
        id: Date.now() + Math.random(),
        text: text,
        completed: false
      });
    });
    saveTodos();
  }
}

// Save todos to localStorage
function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

// Setup event listeners
function setupEventListeners() {
  todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && todoInput.value.trim() !== '') {
      addTodo(todoInput.value.trim());
      todoInput.value = '';
    }
  });

  clearCompletedBtns.forEach(btn => {
    btn.addEventListener('click', clearCompleted);
  });

  setupFilterButtons();
}

// Setup filter button listeners
function setupFilterButtons() {
  const allFilterBtns = document.querySelectorAll('.filter');
  allFilterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const selectedFilter = e.target.textContent.trim();
      currentFilter = selectedFilter;
      updateFilterButtons();
      renderTodos();
    });
  });
}

// Add new todo
function addTodo(text) {
  const todo = {
    id: Date.now(),
    text: text,
    completed: false
  };
  todos.push(todo);
  saveTodos();
  renderTodos();
  updateItemsLeft();
}

// Toggle todo completion
function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    saveTodos();
    renderTodos();
    updateItemsLeft();
  }
}

// Delete todo
function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  saveTodos();
  renderTodos();
  updateItemsLeft();
}

// Clear completed todos
function clearCompleted() {
  todos = todos.filter(t => !t.completed);
  saveTodos();
  renderTodos();
  updateItemsLeft();
}

// Update items left counter
function updateItemsLeft() {
  const activeCount = todos.filter(t => !t.completed).length;
  const itemText = activeCount === 1 ? 'item' : 'items';
  itemsLeftElements.forEach(el => {
    el.textContent = `${activeCount} ${itemText} left`;
  });
}

// Filter todos based on current filter
function getFilteredTodos() {
  switch (currentFilter) {
    case 'Active':
      return todos.filter(t => !t.completed);
    case 'Completed':
      return todos.filter(t => t.completed);
    default:
      return todos;
  }
}

// Render todos
function renderTodos() {
  const existingContainers = todoList.querySelectorAll('.todo-container');
  const existingLines = todoList.querySelectorAll('.line');
  existingContainers.forEach(c => c.remove());
  existingLines.forEach(l => l.remove());

  const filteredTodos = getFilteredTodos();
  const analyticsDiv = todoList.querySelector('.analytics')?.parentElement || 
                       todoList.querySelector('.mobile-version') || 
                       todoList.querySelector('.desktop-version');

  filteredTodos.forEach((todo, index) => {
    const container = createTodoElement(todo);
    
    if (analyticsDiv) {
      todoList.insertBefore(container, analyticsDiv);
    } else {
      todoList.appendChild(container);
    }

    const line = document.createElement('div');
    line.className = 'line';
    if (analyticsDiv) {
      todoList.insertBefore(line, analyticsDiv);
    } else {
      todoList.appendChild(line);
    }
  });
}

// Create todo element
function createTodoElement(todo) {
  const container = document.createElement('div');
  container.className = 'todo-container';
  container.setAttribute('draggable', 'true');
  container.dataset.id = todo.id;
  
  // Smooth transitions only for opacity and box-shadow
  container.style.transition = 'opacity 0.2s ease, box-shadow 0.2s ease';

  const rounded = document.createElement('div');
  rounded.className = 'rounded2';
  
  if (todo.completed) {
    const checkmark = document.createElement('img');
    checkmark.src = 'images/icon-check.svg';
    checkmark.alt = 'check';
    checkmark.style.cssText = 'width: 50%; height: 50%; display: block; max-width: 100%; margin: 7px auto; object-fit: contain;';
    rounded.appendChild(checkmark);
    rounded.style.background = 'linear-gradient(hsl(280, 87%, 65%), hsl(192, 100%, 67%))';
    rounded.style.border = 'none';
  }

  const text = document.createElement('p');
  text.className = 'todo-text';
  text.textContent = todo.text;
  text.style.userSelect = 'none';
  text.style.webkitUserSelect = 'none';
  text.style.webkitTouchCallout = 'none';
  
  if (todo.completed) {
    text.style.textDecoration = 'line-through';
    text.style.opacity = '0.5';
  }

  const deleteBtn = document.createElement('img');
  deleteBtn.src = 'images/icon-cross.svg';
  deleteBtn.alt = 'cross';
  deleteBtn.className = 'delete-btn';
  deleteBtn.style.display = 'none';

  container.appendChild(rounded);
  container.appendChild(text);
  container.appendChild(deleteBtn);

  container.addEventListener('click', (e) => {
    if (!e.target.classList.contains('delete-btn')) {
      toggleTodo(todo.id);
    }
  });

  container.addEventListener('mouseenter', () => {
    deleteBtn.style.display = 'block';
  });

  container.addEventListener('mouseleave', () => {
    deleteBtn.style.display = 'none';
  });

  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    deleteTodo(todo.id);
  });

  // Drag and drop listeners
  container.addEventListener('dragstart', handleDragStart);
  container.addEventListener('dragend', handleDragEnd);
  container.addEventListener('dragover', handleDragOver);
  container.addEventListener('drop', handleDrop);
  container.addEventListener('dragenter', handleDragEnter);
  container.addEventListener('dragleave', handleDragLeave);
  
  // Touch events for mobile
  let touchTimeout = null;
  
  container.addEventListener('touchstart', (e) => {
    touchTimeout = setTimeout(() => {
      container.style.opacity = '0.7';
      container.style.boxShadow = '0 8px 16px rgba(0,0,0,0.3)';
    }, 200);
  }, { passive: true });
  
  container.addEventListener('touchend', (e) => {
    clearTimeout(touchTimeout);
    container.style.opacity = '1';
    container.style.boxShadow = 'none';
  }, { passive: true });
  
  container.addEventListener('touchmove', (e) => {
    clearTimeout(touchTimeout);
  }, { passive: true });

  return container;
}

// ========== DRAG AND DROP ==========
function handleDragStart(e) {
  draggedElement = this;
  
  // Visual feedback - just opacity and shadow, NO transform
  this.style.opacity = '0.5';
  this.style.boxShadow = '0 8px 16px rgba(0,0,0,0.3)';
  
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragEnd(e) {
  // Reset the dragged element
  this.style.opacity = '1';
  this.style.boxShadow = '';
  
  // Clear all borders
  document.querySelectorAll('.todo-container').forEach(container => {
    container.style.borderTop = '';
  });
  
  draggedElement = null;
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = 'move';
  return false;
}

function handleDragEnter(e) {
  if (this !== draggedElement && draggedElement) {
    this.style.borderTop = '3px solid hsl(220, 98%, 61%)';
  }
}

function handleDragLeave(e) {
  this.style.borderTop = '';
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  if (e.preventDefault) {
    e.preventDefault();
  }

  this.style.borderTop = '';

  if (draggedElement && draggedElement !== this) {
    // Get IDs
    const draggedId = parseInt(draggedElement.dataset.id);
    const targetId = parseInt(this.dataset.id);

    // Find indices in todos array
    const draggedIndex = todos.findIndex(t => t.id === draggedId);
    const targetIndex = todos.findIndex(t => t.id === targetId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      // Remove from old position
      const [removed] = todos.splice(draggedIndex, 1);
      // Insert at new position
      todos.splice(targetIndex, 0, removed);

      // Save and re-render
      saveTodos();
      renderTodos();
    }
  }

  return false;
}

// Initialize app when DOM is loaded
init();