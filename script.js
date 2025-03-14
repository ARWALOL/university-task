document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('taskForm');
    const taskList = document.getElementById('taskList');
    const filterPriority = document.getElementById('filterPriority');
    const totalTasksElement = document.getElementById('totalTasks');
    const completedTasksElement = document.getElementById('completedTasks');
    const productivityPercentageElement = document.getElementById('productivityPercentage');

    // تحميل المهام من localStorage عند بدء التشغيل
    loadTasks();

    // إضافة مهمة جديدة
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.getElementById('taskTitle').value;
        const description = document.getElementById('taskDescription').value;
        const dueDate = document.getElementById('taskDueDate').value;
        const priority = document.getElementById('taskPriority').value;
        const userEmail = document.getElementById('userEmail').value;

        addTask(title, description, dueDate, priority, userEmail);
        taskForm.reset();
    });

    // تصفية المهام حسب الأولوية
    filterPriority.addEventListener('change', () => {
        loadTasks();
    });

    function addTask(title, description, dueDate, priority, userEmail) {
        const task = {
            id: Date.now(),
            title,
            description,
            dueDate,
            priority,
            userEmail,
            completed: false,
        };

        saveTask(task);
        displayTask(task);
        checkDueDateAlert(task);
        updateProductivityAnalysis();
    }

    function saveTask(task) {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const selectedPriority = filterPriority.value;
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

        if (selectedPriority !== 'all') {
            tasks = tasks.filter((task) => task.priority === selectedPriority);
        }

        taskList.innerHTML = '';
        tasks.forEach((task) => displayTask(task));
        updateProductivityAnalysis();
    }

    function displayTask(task) {
        const taskElement = document.createElement('div');
        taskElement.classList.add('task');
        taskElement.innerHTML = `
            <h3>${task.title}</h3>
            <p>${task.description}</p>
            <p class="due-date">تاريخ الاستحقاق: ${task.dueDate}</p>
            <p class="priority ${task.priority}">الأولوية: ${task.priority}</p>
            <button onclick="toggleTaskCompletion(${task.id})">${task.completed ? 'إلغاء الإكمال' : 'إكمال'}</button>
            <button onclick="deleteTask(${task.id})">حذف</button>
        `;
        taskList.appendChild(taskElement);
    }

    function checkDueDateAlert(task) {
        const dueDate = new Date(task.dueDate);
        const now = new Date();
        const timeDiff = dueDate - now;
        const hoursDiff = timeDiff / (1000 * 60 * 60);

        if (hoursDiff <= 24) {
            sendEmail(task);
        }
    }

    function sendEmail(task) {
        const templateParams = {
            task_title: task.title,
            due_date: task.dueDate,
            description: task.description,
            user_email: task.userEmail,
        };

        emailjs.send('service_786pf8q', 'template_42ygq0b', templateParams)
            .then((response) => {
                console.log('تم إرسال البريد الإلكتروني بنجاح!', response.status, response.text);
            }, (error) => {
                console.error('فشل إرسال البريد الإلكتروني:', error);
            });
    }

    function updateProductivityAnalysis() {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((task) => task.completed).length;
        const productivityPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

        totalTasksElement.textContent = totalTasks;
        completedTasksElement.textContent = completedTasks;
        productivityPercentageElement.textContent = `${productivityPercentage}%`;
    }

    window.toggleTaskCompletion = (taskId) => {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks = tasks.map((task) => {
            if (task.id === taskId) {
                task.completed = !task.completed;
            }
            return task;
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
        loadTasks();
    };

    window.deleteTask = (taskId) => {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks = tasks.filter((task) => task.id !== taskId);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        taskList.innerHTML = '';
        loadTasks();
    };
});