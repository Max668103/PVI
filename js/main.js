document.getElementById("menuBtn").addEventListener("click", function () {
    document.querySelector(".toggleMenu").classList.toggle("open");
    this.classList.toggle("open");
});

document.getElementById('profile-menu__button').addEventListener('click', () => {
    if (document.getElementById('profile-menu__button').textContent.trim() === "Log Out") {
        fetch("logout.php")
            .then(res => res.json())
            .then(() => {
                alert("👋 Goodbye!");
                window.location.reload();
            })
            .catch(err => {
                console.error("Logout error:", err);
                alert("⚠️ Error connecting to server");
            });
    } else {
        const modal = document.getElementById('registration-modal');
        const form = document.getElementById('registration-form');
        const closeButton = document.querySelector('.login-header__exit');
        const cancelButton = document.getElementById('cancel-button-login');
        const okButton = document.getElementById('ok-button-login');

        modal.style.display = 'block';

        const closeModal = () => {
            modal.style.display = 'none';
            form.reset();
        };

        const submitForm = async () => {
            if (form.checkValidity()) {
                const fullName = document.getElementById('username').value.trim();
                const password = document.getElementById('password').value.trim();
        
                const [firstName, lastName] = fullName.split(" ");
        
                if (!firstName || !lastName) {
                    alert("Введіть ім'я та прізвище через пробіл (наприклад: Max Skydanchuk)");
                    return;
                }
        
                try {
                    const response = await fetch("login.php", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            firstName: firstName,
                            lastName: lastName,
                            password: password
                        })
                    });
        
                    const result = await response.json();
                    if (response.ok && result.status === "success") {
                        alert("✅ Success: " + result.name);
                        closeModal();
                        setTimeout(() => window.location.reload(true), 100); // Reload після alert
                    } else {
                        alert("❌ " + (result.message || "Wrong input"));
                        closeModal();
                    }
                } catch (error) {
                    console.error("Login error:", error);
                    alert("⚠️ Error connecting to server");
                }
            } else {
                form.reportValidity();
            }
        };

        closeButton.onclick = closeModal;
        cancelButton.onclick = closeModal;
        okButton.onclick = submitForm;
    }
});


setTimeout(() => {
    document.querySelector(".notification a img").classList.add("start-shake");
    document.querySelector(".notification .newMessages").style.opacity = "1";
    document.querySelector(".notification .newMessages").style.transform = "scale(1)";
}, 10000);

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register('./sw.js')
            .then(() => console.log("Service Worker registered"))
            .catch((err) => console.error("Service Worker registration failed", err));
    });
}

window.onload = async function () {
    const loginBtn = document.getElementById("profile-menu__button");

    try {
        const response = await fetch("./students.php");
        if (!response.ok) {
            if (response.status === 401) {
                document.querySelector(".notification").classList.add("disabled");
                document.getElementById("profile-menu__profile").style.display = "none";
                document.querySelector(".profile-menu").style.height = "65px";

                document.getElementById("profile-name").textContent = "Guest";
                
                loginBtn.textContent = "Log In";
                return;
            }
            throw new Error("Error while connecting to server");
        }

        const result = await response.json();
        loginBtn.textContent = "Log Out";

        document.getElementById("profile-image").src = result.user_image || "images/default.png";
        document.getElementById("profile-name").textContent = result.user_name || "Guest";

    } catch (error) {
        console.error("Session check error:", error);
    }
}



