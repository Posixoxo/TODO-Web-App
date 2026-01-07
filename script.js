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
const filterBtns = document.querySelectorAll('.filter');

let todos = [];
let currentFilter = 'All';
let draggedElement = null;

// Initialize app
function init() {
  // Load todos from localStorage or use existing HTML todos
  loadTodos();
  updateItemsLeft();
  setupEventListeners();
  renderTodos();
}

// Load todos from localStorage or existing HTML
function loadTodos() {
  const savedTodos = localStorage.getItem('todos');
  
  if (savedTodos) {
    // Load from localStorage
    todos = JSON.parse(savedTodos);
  } else {
    // Load existing todos from HTML into our todos array (first time only)
    const existingContainers = document.querySelectorAll('.todo-container');
    existingContainers.forEach(container => {
      const text = container.querySelector('.todo-text').textContent;
      todos.push({
        id: Date.now() + Math.random(),
        text: text,
        completed: false
      });
    });
    // Save to localStorage
    saveTodos();
  }
}

// Save todos to localStorage
function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

// Setup event listeners
function setupEventListeners() {
  // Add todo on Enter key
  todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && todoInput.value.trim() !== '') {
      addTodo(todoInput.value.trim());
      todoInput.value = '';
    }
  });

  // Clear completed buttons
  clearCompletedBtns.forEach(btn => {
    btn.addEventListener('click', clearCompleted);
  });

  // Filter buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Remove active class from all filters
      filterBtns.forEach(f => f.classList.remove('active'));
      // Add active class to clicked filter
      e.target.classList.add('active');
      currentFilter = e.target.textContent;
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
  // Remove all existing todo-containers and lines
  const existingContainers = todoList.querySelectorAll('.todo-container');
  const existingLines = todoList.querySelectorAll('.line');
  existingContainers.forEach(c => c.remove());
  existingLines.forEach(l => l.remove());

  const filteredTodos = getFilteredTodos();
  const analyticsDiv = todoList.querySelector('.analytics')?.parentElement || 
                       todoList.querySelector('.mobile-version') || 
                       todoList.querySelector('.desktop-version');

  filteredTodos.forEach((todo, index) => {
    // Create todo container
    const container = createTodoElement(todo);
    
    // Insert before analytics section
    if (analyticsDiv) {
      todoList.insertBefore(container, analyticsDiv);
    } else {
      todoList.appendChild(container);
    }

    // Add line separator after each item (including the last one)
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

  // Create rounded checkbox
  const rounded = document.createElement('div');
  rounded.className = 'rounded2';
  
  // Add checkmark if completed
  if (todo.completed) {
    const checkmark = document.createElement('img');
    checkmark.src = 'images/icon-check.svg';
    checkmark.alt = 'check';
    checkmark.style.cssText = 'width: 50%; height: 50%; display: block; max-width: 100%; margin: 7px auto; object-fit: contain;';
    rounded.appendChild(checkmark);
    rounded.style.background = 'linear-gradient(hsl(280, 87%, 65%), hsl(192, 100%, 67%))';
    rounded.style.border = 'none';
  }

  // Create todo text
  const text = document.createElement('p');
  text.className = 'todo-text';
  text.textContent = todo.text;
  if (todo.completed) {
    text.style.textDecoration = 'line-through';
    text.style.opacity = '0.5';
  }

  // Create delete button
  const deleteBtn = document.createElement('img');
  deleteBtn.src = 'images/icon-cross.svg';
  deleteBtn.alt = 'cross';
  deleteBtn.className = 'delete-btn';
  deleteBtn.style.display = 'none';

  // Append elements
  container.appendChild(rounded);
  container.appendChild(text);
  container.appendChild(deleteBtn);

  // Event listeners
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

  return container;
}

// ========== DRAG AND DROP ==========
function handleDragStart(e) {
  draggedElement = this;
  this.style.opacity = '0.4';
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragEnd(e) {
  this.style.opacity = '1';
  
  // Remove all drag-over classes
  document.querySelectorAll('.todo-container').forEach(container => {
    container.style.borderTop = '';
  });
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = 'move';
  return false;
}

function handleDragEnter(e) {
  if (this !== draggedElement) {
    this.style.borderTop = '2px solid hsl(220, 98%, 61%)';
  }
}

function handleDragLeave(e) {
  this.style.borderTop = '';
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }

  if (draggedElement !== this) {
    // Get IDs
    const draggedId = parseInt(draggedElement.dataset.id);
    const targetId = parseInt(this.dataset.id);

    // Find indices
    const draggedIndex = todos.findIndex(t => t.id === draggedId);
    const targetIndex = todos.findIndex(t => t.id === targetId);

    // Reorder array
    const [removed] = todos.splice(draggedIndex, 1);
    todos.splice(targetIndex, 0, removed);

    // Save and re-render
    saveTodos();
    renderTodos();
  }

  this.style.borderTop = '';
  return false;
}

// Initialize app when DOM is loaded
init();