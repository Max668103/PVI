class Student {
    constructor(group, firstName, lastName, gender, birthday) {
        this.group = group;
        this.firstName = firstName;
        this.lastName = lastName;
        this.gender = gender;
        this.birthday = birthday;
    }
}

let listOfStudents = [];

function addStudent(check) {
    let group = document.getElementById("group").value;
    let firstName = document.getElementById("firstName").value;
    let lastName = document.getElementById("lastName").value;
    let gender = document.getElementById("gender").value;
    let birthday = document.getElementById("birthday").value;

    if (!firstName || !lastName || !birthday || group == "" || gender == "") {
        if (check) {
            window.alert("Please fill in all fields!");
            return;
        }
        else {
            closeModal();
            return;
        }
    }

    let newStudent = new Student(group, firstName, lastName, gender, birthday);
    listOfStudents.push(newStudent);

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

            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = "mainCheckbox";
            checkbox.onclick = checkAll;
            checkbox.title = "Click All";

            th.appendChild(label);
            th.appendChild(checkbox);
            th.classList.add("checkboxColumn");
            th.setAttribute("aria-label", "Checkboxes");
        } else {
            th.textContent = text;
        }
        return th;
    });

    headerCells.forEach(th => headerRow.appendChild(th));
    table.appendChild(headerRow);

    let profileStudentName = document.querySelector(".profile p").textContent.trim();

    listOfStudents.forEach((student, index) => {
        let row = document.createElement("tr");

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
        editButton.onclick = () => editStudent(index);
        let editImg = document.createElement("img");
        editImg.src = "./images/pencil.png";
        editImg.alt = "Pencil";
        editButton.appendChild(editImg);

        let deleteButton = document.createElement("button");
        deleteButton.onclick = () => deleteStudent(index);
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
    document.getElementById("group").value = "";
    document.getElementById("firstName").value = "";
    document.getElementById("lastName").value = "";
    document.getElementById("gender").value = "";
    document.getElementById("birthday").value = "";
}

function editStudent(index) {
    let checkboxes = document.querySelectorAll(".studentCheckbox");
    let selectedCheckboxes = Array.from(checkboxes).filter(checkbox => checkbox.checked);

    if (selectedCheckboxes.length > 1) {
        alert("Only one at a time can be edited!");
        return;
    }
    
    if (checkboxes[index].checked) {
        openModalForEdit();
    } else {
        alert("Check the student if you want to edit him!");
    }
}

function deleteStudent(index) {
    let checkboxes = document.querySelectorAll(".studentCheckbox");
    if (!checkboxes[index].checked) return;

    let indexesToDelete = [];
    let studentsToDelete = [];

    checkboxes.forEach((checkbox, i) => {
        if (checkbox.checked) {
            indexesToDelete.push(i);
            studentsToDelete.push(`${listOfStudents[i].firstName} ${listOfStudents[i].lastName}`);
        }
    });

    openDeleteModal(indexesToDelete, studentsToDelete);
}

function openDeleteModal(indexesToDelete, studentsToDelete) {
    let modal = document.getElementById("myModalDelete");

    let message = document.querySelector(".modalWindowDelete div p");
    message.innerHTML = `Do you want to delete <strong>${studentsToDelete.join(", ")}</strong>?`;

    document.querySelector(".modalWindowDelete header button").onclick = closeDeleteModal;
    document.querySelector(".modalWindowDelete footer .disable").onclick = closeDeleteModal;

    let okButton = document.querySelector(".modalWindowDelete footer .active");
    okButton.onclick = function() {
        confirmDelete(indexesToDelete);
    };

    modal.style.display = "block";
}

function confirmDelete(indexesToDelete) {
    for (let i = indexesToDelete.length - 1; i >= 0; i--) {
        listOfStudents.splice(indexesToDelete[i], 1);
    }
    
    updateTable();
    closeDeleteModal();
}

function closeDeleteModal() {
    document.getElementById("myModalDelete").style.display = "none";
}

function openModal() {
    document.getElementById("myModal").style.display = "block";
    document.querySelector("#myModal header h1").textContent = "Add student";
}

function openModalForEdit() {
    document.querySelector("#myModal header h1").textContent = "Edit student";
    document.getElementById("myModal").style.display = "block";
}

function closeModal() {
    document.getElementById("myModal").style.display = "none";
    clearForm();
}

function checkAll() {
    let checkAllBox = document.getElementById("mainCheckbox");
    let checkboxes = document.querySelectorAll(".studentCheckbox");

    checkboxes.forEach(function(checkbox) {
        checkbox.checked = checkAllBox.checked;
    });
}

listOfStudents.push(new Student("PZ-25", "Max", "Skydanchuk", "Male", "2006-04-07"));
listOfStudents.push(new Student("PZ-24", "Nastya", "Storozhenko", "Female", "2006-10-19"));
listOfStudents.push(new Student("PZ-23", "Marichka", "Cherkyn", "Female", "2006-06-17"));
listOfStudents.push(new Student("PZ-25", "Max", "Skydanchuk", "Male", "2006-04-07"));
listOfStudents.push(new Student("PZ-24", "Nastya", "Storozhenko", "Female", "2006-10-19"));
listOfStudents.push(new Student("PZ-23", "Marichka", "Cherkyn", "Female", "2006-06-17"));
listOfStudents.push(new Student("PZ-25", "Max", "Skydanchuk", "Male", "2006-04-07"));
listOfStudents.push(new Student("PZ-24", "Nastya", "Storozhenko", "Female", "2006-10-19"));
listOfStudents.push(new Student("PZ-23", "Marichka", "Cherkyn", "Female", "2006-06-17"));
listOfStudents.push(new Student("PZ-25", "Max", "Skydanchuk", "Male", "2006-04-07"));
listOfStudents.push(new Student("PZ-24", "Nastya", "Storozhenko", "Female", "2006-10-19"));
listOfStudents.push(new Student("PZ-23", "Marichka", "Cherkyn", "Female", "2006-06-17"));
window.onload = function() {
    updateTable();
};