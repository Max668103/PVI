class Student {
    constructor(id, group, firstName, lastName, gender, birthday) {
        this.id = id;
        this.group = group;
        this.firstName = firstName;
        this.lastName = lastName;
        this.gender = gender;
        this.birthday = birthday;
    }
}

let listOfStudents = [];

function updateStudentIds() {
    listOfStudents.forEach((student, index) => {
        student.id = index; // Оновлюємо ID відповідно до індексу
    });
}

function addStudent(check) {
    if (!validateForm()) {
        if (check) {
            window.alert("Please fill in all fields correctly!");
        }
        return;
    }

    let group = document.getElementById("group").value;
    let firstName = document.getElementById("firstName").value;
    let lastName = document.getElementById("lastName").value;
    let gender = document.getElementById("gender").value;
    let birthday = document.getElementById("birthday").value;

    let newStudent = new Student(listOfStudents.length, group, firstName, lastName, gender, birthday);
    listOfStudents.push(newStudent);
    updateStudentIds();

    updateTable();
    closeModal();
}

function updateTable() {
    let table = document.getElementById("tableOfStudents");
    
    table.innerHTML = "";
    let headerRow = document.createElement("tr");
    let headers = ["Checkboxes", "Group", "Name", "Gender", "Birthday", "Status", "Options"];
    let headerCells = headers.map(text => {
        let th = document.createElement("th");
        if (text === "Checkboxes") {
            let label = document.createElement("label");
            label.setAttribute("for", "mainCheckbox");
            label.classList.add("sr-only");
            label.textContent = "Select all";
    
            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = "mainCheckbox";
            checkbox.onclick = checkAll;
            checkbox.title = "Click All";
    
            th.appendChild(label);
            th.appendChild(checkbox);
            th.classList.add("checkboxColumn");
        } else {
            th.textContent = text;
        }
        return th;
    });

    headerCells.forEach(th => headerRow.appendChild(th));
    table.appendChild(headerRow);

    let profileStudentName = document.querySelector(".profile p").textContent.trim();

    listOfStudents.forEach(student => {
        let row = document.createElement("tr");
        row.dataset.studentId = student.id;

        let checkboxTd = document.createElement("td");
        checkboxTd.classList.add("checkboxColumn");
        checkboxTd.setAttribute("aria-label", "Checkboxes");

        let studentCheckbox = document.createElement("input");
        studentCheckbox.type = "checkbox";
        studentCheckbox.classList.add("studentCheckbox");
        studentCheckbox.title = "Click this";
        checkboxTd.appendChild(studentCheckbox);
        row.appendChild(checkboxTd);

        let studentData = [student.group, `${student.firstName} ${student.lastName}`, student.gender, student.birthday];
        studentData.forEach(text => {
            let td = document.createElement("td");
            td.textContent = text;
            row.appendChild(td);
        });

        let statusTd = document.createElement("td");
        let statusDiv = document.createElement("div");
        statusDiv.classList.add("activeStatus");
        if (`${student.firstName} ${student.lastName}` === profileStudentName) {
            statusDiv.style.backgroundColor = "green";
        }
        statusTd.appendChild(statusDiv);
        row.appendChild(statusTd);

        let optionsTd = document.createElement("td");
        let buttonGroup = document.createElement("div");
        buttonGroup.classList.add("button-group");

        let editButton = document.createElement("button");
        editButton.classList.add("edit-button");
        editButton.onclick = () => editStudent(row);
        let editImg = document.createElement("img");
        editImg.src = "./images/pencil.png";
        editImg.alt = "Pencil";
        editButton.appendChild(editImg);

        let deleteButton = document.createElement("button");
        deleteButton.onclick = () => deleteStudent(row);
        let deleteImg = document.createElement("img");
        deleteImg.src = "./images/cross.png";
        deleteImg.alt = "Cross";
        deleteButton.appendChild(deleteImg);

        buttonGroup.appendChild(editButton);
        buttonGroup.appendChild(deleteButton);
        optionsTd.appendChild(buttonGroup);
        row.appendChild(optionsTd);

        table.appendChild(row);
    });
}

function clearForm() {
    document.getElementById("studentForm").reset();
}


function editStudent(row) { 
    // Перевірка, чи вибрано чекбокс тільки цього студента
    let checkboxes = document.querySelectorAll(".studentCheckbox");
    let selectedCheckboxes = Array.from(checkboxes).filter(checkbox => checkbox.checked);

    if (selectedCheckboxes.length !== 1 || !row.querySelector("input[type='checkbox']").checked) {
        alert("You must select only one student to edit.");
        return;
    }

    // Отримуємо ID студента з data-атрибуту рядка
    let studentId = row.dataset.studentId;

    // Знайти студента за ID
    let student = listOfStudents.find(s => s.id == studentId); // Перевіряємо через ==
    if (!student) return;

    openModalForEdit(student);
}

function deleteStudent(row) {
    if (!row.querySelector("input[type='checkbox']").checked) return;

    let idsToDelete = [...document.querySelectorAll(".studentCheckbox:checked")]
        .map(checkbox => checkbox.closest("tr").dataset.studentId);

    openDeleteModal(idsToDelete);
}

function openDeleteModal(idsToDelete) {
    let modal = document.getElementById("myModalDelete");

    let studentsToDelete = idsToDelete.map(id => {
        let student = listOfStudents.find(s => s.id == id);
        return student ? `${student.firstName} ${student.lastName}` : "Unknown Student";
    });

    let message = document.querySelector(".modalWindowDelete div p");
    message.innerHTML = `Do you want to delete <strong>${studentsToDelete.join(", ")}</strong>?`;

    document.querySelector(".modalWindowDelete header button").onclick = closeDeleteModal;
    document.querySelector(".modalWindowDelete footer .disable").onclick = closeDeleteModal;

    let okButton = document.querySelector(".modalWindowDelete footer .active");
    okButton.onclick = function() {
        confirmDelete(idsToDelete);
    };

    modal.style.display = "block";
}


function confirmDelete(idsToDelete) {
    listOfStudents = listOfStudents.filter(student => !idsToDelete.includes(student.id.toString()));

    updateStudentIds();
    updateTable();
    closeDeleteModal();
}

function closeDeleteModal() {
    document.getElementById("myModalDelete").style.display = "none";
}

function openModal() {
    document.getElementById("mainCheckbox").checked = false;
    checkAll();
    document.getElementById("myModal").style.display = "block";
    document.getElementById("overlay").style.display = "block";
    document.querySelector("#myModal header h1").textContent = "Add student";

    document.querySelector("#myModal footer .active").textContent = "Create";
    document.querySelector("#myModal footer .active").onclick = function () {
        addStudent(true);
    };

    document.querySelector("#myModal footer .disable").onclick = function () {
        addStudent(false)
    };
}

function openModalForEdit(student) {
    document.querySelector("#myModal header h1").textContent = "Edit student";

    document.querySelector("#myModal footer .active").textContent = "Save";
    document.querySelector("#myModal footer .active").onclick = function () {
        saveStudent(student.id, true);
    };

    document.querySelector("#myModal footer .disable").onclick = function () {
        saveStudent(student.id, false);
    };

    // Заповнюємо поля форми даними студента
    document.getElementById("studentId").value = student.id;
    document.getElementById("group").value = student.group;
    document.getElementById("firstName").value = student.firstName;
    document.getElementById("lastName").value = student.lastName;
    document.getElementById("gender").value = student.gender;
    document.getElementById("birthday").value = student.birthday;

    document.getElementById("myModal").style.display = "block";
    document.getElementById("overlay").style.display = "block";
}

function saveStudent(id, check) {
    let student = listOfStudents.find(s => s.id === id);
    if (!student) return;

    if (!validateForm()) {
        if (check) {
            window.alert("Please fill in all fields correctly!");
        }
        return;
    }

    let group = document.getElementById("group").value;
    let firstName = document.getElementById("firstName").value;
    let lastName = document.getElementById("lastName").value;
    let gender = document.getElementById("gender").value;
    let birthday = document.getElementById("birthday").value;

    // Оновлюємо дані студента
    student.group = group;
    student.firstName = firstName;
    student.lastName = lastName;
    student.gender = gender;
    student.birthday = birthday;

    updateTable();
    closeModal();
}

function closeModal() {
    document.getElementById("myModal").style.display = "none";
    document.getElementById("overlay").style.display = "none";
    document.querySelectorAll(".ModalWindow input, .ModalWindow select").forEach(element => {
        element.classList.remove('invalid');
    });
    // Приховуємо всі помилки
    document.querySelectorAll(".error-message").forEach(error => {
        error.style.display = "none";
    });
    clearForm();
}

function checkAll() {
    let checkAllBox = document.getElementById("mainCheckbox");
    let checkboxes = document.querySelectorAll(".studentCheckbox");

    checkboxes.forEach(function(checkbox) {
        checkbox.checked = checkAllBox.checked;
    });
}

document.querySelectorAll(".ModalWindow input[required], .ModalWindow select[required]").forEach(element => {
    element.addEventListener("input", () => validateField(element));
    element.addEventListener("blur", () => validateField(element));
});

function validateField(field) {
    let errorSpan = document.getElementById(field.id + "-error");

    if (!field.checkValidity()) {
        field.classList.add('invalid');
        if (errorSpan) errorSpan.style.display = "inline";
    } else {
        field.classList.remove('invalid');
        if (errorSpan) errorSpan.style.display = "none";
    }
}

function validateForm() {
    let isValid = true;
    let inputs = document.querySelectorAll(".ModalWindow input[required], .ModalWindow select[required]");

    inputs.forEach(input => {
        validateField(input);
        if (!input.checkValidity()) {
            isValid = false;
        }
    });

    return isValid;
}

document.addEventListener("DOMContentLoaded", function () {
    let birthdayInput = document.getElementById("birthday");
    let today = new Date();
    let minYear = today.getFullYear() - 100;
    let maxYear = today.getFullYear() - 16;

    birthdayInput.min = `${minYear}-01-01`;
    birthdayInput.max = `${maxYear}-12-31`;
});


listOfStudents.push(new Student(listOfStudents.length, "PZ-25", "Max", "Skydanchuk", "Male", "2006-04-07"));
listOfStudents.push(new Student(listOfStudents.length, "PZ-24", "Nastya", "Storozhenko", "Female", "2006-10-19"));
listOfStudents.push(new Student(listOfStudents.length, "PZ-23", "Marichka", "Cherkyn", "Female", "2006-06-17"));
listOfStudents.push(new Student(listOfStudents.length, "PZ-25", "Max", "Skydanchuk", "Male", "2006-04-07"));
listOfStudents.push(new Student(listOfStudents.length, "PZ-24", "Nastya", "Storozhenko", "Female", "2006-10-19"));
listOfStudents.push(new Student(listOfStudents.length, "PZ-23", "Marichka", "Cherkyn", "Female", "2006-06-17"));
listOfStudents.push(new Student(listOfStudents.length, "PZ-25", "Max", "Skydanchuk", "Male", "2006-04-07"));
listOfStudents.push(new Student(listOfStudents.length, "PZ-24", "Nastya", "Storozhenko", "Female", "2006-10-19"));
listOfStudents.push(new Student(listOfStudents.length, "PZ-23", "Marichka", "Cherkyn", "Female", "2006-06-17"));
listOfStudents.push(new Student(listOfStudents.length, "PZ-25", "Max", "Skydanchuk", "Male", "2006-04-07"));
listOfStudents.push(new Student(listOfStudents.length, "PZ-24", "Nastya", "Storozhenko", "Female", "2006-10-19"));
listOfStudents.push(new Student(listOfStudents.length, "PZ-23", "Marichka", "Cherkyn", "Female", "2006-06-17"));
window.onload = function() {
    updateTable();
};