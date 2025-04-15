class Student {
    constructor(id, group, firstName, lastName, gender, birthday, status) {
        this.id = id;
        this.group = group;
        this.firstName = firstName;
        this.lastName = lastName;
        this.gender = gender;
        this.birthday = birthday;
        this.status = status || "inactive";
    }
}

let listOfStudents = [];
let currentPage = 1;
const studentsPerPage = 7;

async function addStudent(check) {
    if (!validateForm()) {
        if (check) {
            alert("Please fill in all fields correctly!");
        } else {
            closeModal();
        }
        return;
    }

    const newStudent = {
        group: document.getElementById("group").value,
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        gender: document.getElementById("gender").value,
        birthday: document.getElementById("birthday").value,
    };

    try {
        const response = await fetch("./students.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newStudent),
        });

        const result = await response.json();

        if (!response.ok) {
            // Якщо статус не 2xx — показуємо повідомлення з сервера
            alert(result.error);
            closeModal();
            return;
        }

        listOfStudents.push(new Student(result.id, result.group, result.firstName, result.lastName, result.gender, result.birthday));

        updateTable();
        closeModal();
    } catch (error) {
        alert("Помилка з'єднання з сервером. Спробуйте пізніше.");
        console.error("Error adding student:", error);
    }
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

    // Обчислюємо межі поточної сторінки
    const startIndex = (currentPage - 1) * studentsPerPage;
    const endIndex = startIndex + studentsPerPage;

    // Фільтруємо студентів для цієї сторінки
    const visibleStudents = listOfStudents.slice(startIndex, endIndex);

    // Далі рендеримо лише visibleStudents
    visibleStudents.forEach(student => {
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
        statusDiv.style.backgroundColor = student.status === "active" ? "green" : "gray";
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


    updatePagination();

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
    document.getElementById("overlayDelete").style.display = "block";
}

async function confirmDelete(idsToDelete) {
    try {
        for (let id of idsToDelete) {
            await fetch("./students.php", {
                method: "DELETE",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `id=${id}`,
            });
        }

        listOfStudents = listOfStudents.filter(student => !idsToDelete.includes(student.id.toString()));
        updateTable();
        closeDeleteModal();
    } catch (error) {
        console.error("Error deleting student(s):", error);
    }
}

function closeDeleteModal() {
    document.getElementById("myModalDelete").style.display = "none";
    document.getElementById("overlayDelete").style.display = "none";
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

async function saveStudent(id, check) {
    
    let student = listOfStudents.find(s => s.id === id);
    if (!student) return;

    if (!validateForm()) {
        if (check) alert("Please fill in all fields correctly!");
        else closeModal();
        return;
    }

    const updatedStudent = {
        id: id,
        group: document.getElementById("group").value,
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        gender: document.getElementById("gender").value,
        birthday: document.getElementById("birthday").value,
    };

    try {
        await fetch("./students.php", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedStudent),
        });

        const index = listOfStudents.findIndex(s => s.id === id);
        listOfStudents[index] = new Student(id, updatedStudent.group, updatedStudent.firstName, updatedStudent.lastName, updatedStudent.gender, updatedStudent.birthday);

        updateTable();
        closeModal();
    } catch (error) {
        console.error("Error updating student:", error);
    }
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







function updatePagination() {
    const totalPages = Math.ceil(listOfStudents.length / studentsPerPage);
    const paginationContainer = document.querySelector(".pages");
  
    paginationContainer.innerHTML = "";
  
    // Стрілка назад
    const prevBtn = document.createElement("button");
    prevBtn.className = "arrow left";
    prevBtn.innerHTML = "&laquo;";
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
      currentPage--;
      updateTable();
    };
    paginationContainer.appendChild(prevBtn);
  
    // Кнопки сторінок
    for (let i = 1; i <= totalPages; i++) {
      const pageBtn = document.createElement("button");
      pageBtn.className = "page-number";
      pageBtn.textContent = i;
      if (i === currentPage) pageBtn.disabled = true;
  
      pageBtn.onclick = () => {
        currentPage = i;
        updateTable();
      };
      paginationContainer.appendChild(pageBtn);
    }
  
    // Стрілка вперед
    const nextBtn = document.createElement("button");
    nextBtn.className = "arrow right";
    nextBtn.innerHTML = "&raquo;";
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => {
      currentPage++;
      updateTable();
    };
    paginationContainer.appendChild(nextBtn);
}


// window.onload = async function () {

//     try {
//         const response = await fetch("./students.php");
//         const data = await response.json();
//         listOfStudents = data.map(s => new Student(s.id, s.group, s.firstName, s.lastName, s.gender, s.birthday));
//         updateTable();
//     } catch (error) {
//         console.error("Failed to load students:", error);
//     }
//     // const loggedInId = localStorage.getItem("loggedStudent");
//     // if(loggedInId !== null)
//     // {
        
//     // }
//     // else{
//     //     document.getElementById("profile-menu__profile").style.display = "none";
//     //     document.getElementById("openButtonAddModal").disabled = true;
//     //     document.getElementById("new-message-bell").disabled = true;
//     //     document.querySelectorAll(".menu-item").forEach(a => {
//     //         a.disabled = true;
//     //     });
//     // }
// }

window.onload = async function () {
    const loginBtn = document.getElementById("profile-menu__button");
    
    try {
        const response = await fetch("./students.php");
        if (!response.ok) {
            if (response.status === 401) {

                document.getElementById("openButtonAddModal").disabled = true;
                document.getElementById("new-message-bell").disabled = true;
                document.querySelector(".notification").classList.add("disabled");
                document.getElementById("profile-menu__profile").style.display = "none";
                document.querySelector(".profile-menu").style.height = "65px";

                document.getElementById("profile-name").textContent = "Guest";

                loginBtn.textContent = "Log In";
                return;
            }
            throw new Error("Error while connecting to server");
        }

        const data = await response.json();

        document.getElementById("profile-image").src = data.user_image || "images/default.png";
        document.getElementById("profile-name").textContent = data.user_name || "Guest";

        loginBtn.textContent = "Log Out";
        listOfStudents = data.students.map(s => new Student(s.id, s.group, s.firstName, s.lastName, s.gender, s.birthday, s.status));
        updateTable();
    } catch (error) {
        console.error("Failed to load students:", error);
    }
};