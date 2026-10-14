const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");

const pendingList = document.getElementById("pendingList");
const completedList = document.getElementById("completedList");

const pendingCount = document.getElementById("pendingCount");
const completedCount = document.getElementById("completedCount");

const pendingEmpty = document.getElementById("pendingEmpty");
const completedEmpty = document.getElementById("completedEmpty");

const STORAGE_KEY = "myTodoTasks";

let tasks = loadTasks();

function loadTasks() {
    try {
        const savedTasks = localStorage.getItem(STORAGE_KEY);

        if (!savedTasks) {
            return [];
        }

        const parsedTasks = JSON.parse(savedTasks);

        if (!Array.isArray(parsedTasks)) {
            return [];
        }

        return parsedTasks.filter(task =>
            task &&
            typeof task.id === "string" &&
            typeof task.text === "string" &&
            task.text.trim() !== "" &&
            typeof task.completed === "boolean" &&
            typeof task.createdAt === "string"
        ).map(task => ({
            id: task.id,
            text: task.text,
            completed: task.completed,
            createdAt: task.createdAt,
            completedAt:
                typeof task.completedAt === "string"
                    ? task.completedAt
                    : null
        }));
    } catch (error) {
        console.error("Could not load saved tasks:", error);
        return [];
    }
}

function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
        console.error("Could not save tasks:", error);
        alert("Tasks could not be saved. Check your browser storage.");
    }
}

function createId() {
    if (crypto.randomUUID) {
        return crypto.randomUUID();
    }

    return Date.now().toString(36) +
        Math.random().toString(36).slice(2);
}

function formatTime(timestamp) {
    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
        return "Time unavailable";
    }

    return date.toLocaleString([], {
        dateStyle: "medium",
        timeStyle: "short"
    });
}

taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const text = taskInput.value.trim();

    if (!text) {
        taskInput.focus();
        return;
    }

    const task = {
        id: createId(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null
    };

    tasks.unshift(task);

    saveTasks();
    renderTasks();

    taskInput.value = "";
    taskInput.focus();
});

function createTextElement(tag, className, text) {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = text;

    return element;
}

function createButton(label, className, action) {
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = label;
    button.className = className;
    button.addEventListener("click", action);

    return button;
}

function createTaskElement(task) {
    const item = document.createElement("li");
    item.className = "task-item";
    item.dataset.taskId = task.id;

    const info = document.createElement("div");
    info.className = "task-info";

    const taskText = createTextElement(
        "span",
        "task-text",
        task.text
    );

    info.appendChild(taskText);

    const addedTime = createTextElement(
        "small",
        "task-time",
        "Added: " + formatTime(task.createdAt)
    );

    info.appendChild(addedTime);

    if (task.completed && task.completedAt) {
        const completedTime = createTextElement(
            "small",
            "task-time",
            "Completed: " + formatTime(task.completedAt)
        );

        info.appendChild(completedTime);
    }

    const actions = document.createElement("div");
    actions.className = "task-actions";

    if (task.completed) {
        actions.appendChild(
            createButton("Undo", "complete-btn", function () {
                toggleComplete(task.id);
            })
        );
    } else {
        actions.appendChild(
            createButton("Complete", "complete-btn", function () {
                toggleComplete(task.id);
            })
        );
    }

    actions.appendChild(
        createButton("Edit", "edit-btn", function () {
            editTask(task.id);
        })
    );

    actions.appendChild(
        createButton("Delete", "delete-btn", function () {
            deleteTask(task.id);
        })
    );

    item.appendChild(info);
    item.appendChild(actions);

    return item;
}

function renderTasks() {
    pendingList.replaceChildren();
    completedList.replaceChildren();

    const pendingTasks = tasks.filter(task => !task.completed);
    const completedTasks = tasks.filter(task => task.completed);

    pendingTasks.forEach(task => {
        pendingList.appendChild(createTaskElement(task));
    });

    completedTasks.forEach(task => {
        completedList.appendChild(createTaskElement(task));
    });

    pendingCount.textContent = pendingTasks.length + " pending";
    completedCount.textContent = completedTasks.length + " completed";

    pendingEmpty.hidden = pendingTasks.length > 0;
    completedEmpty.hidden = completedTasks.length > 0;
}

function toggleComplete(id) {
    const task = tasks.find(task => task.id === id);

    if (!task) return;

    task.completed = !task.completed;

    if (task.completed) {
        task.completedAt = new Date().toISOString();
    } else {
        task.completedAt = null;
    }

    saveTasks();
    renderTasks();
}


function editTask(id) {
    const task = tasks.find(task => task.id === id);
    const item = document.querySelector(
        `[data-task-id="${CSS.escape(id)}"]`
    );

    if (!task || !item) return;

    const textElement = item.querySelector(".task-text");
    const editor = document.createElement("input");

    editor.type = "text";
    editor.value = task.text;
    editor.maxLength = 200;
    editor.className = "edit-input";
    editor.setAttribute("aria-label", "Edit task");

    const actions = item.querySelector(".task-actions");
    actions.replaceChildren();

    const saveButton = createButton("Save", "complete-btn", saveEdit);
    const cancelButton = createButton("Cancel", "edit-btn", renderTasks);

    actions.append(saveButton, cancelButton);
    textElement.replaceWith(editor);

    function saveEdit() {
        const newText = editor.value.trim();

        if (!newText) {
            alert("Task cannot be empty.");
            editor.focus();
            return;
        }

        task.text = newText;
        saveTasks();
        renderTasks();
    }

    editor.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            saveEdit();
        } else if (event.key === "Escape") {
            renderTasks();
        }
    });

    editor.focus();
    editor.select();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);

    saveTasks();
    renderTasks();
}

renderTasks();