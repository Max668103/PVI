async function uploadAvatar() {
    const input = document.getElementById("avatar-input");
    const file = input.files[0];

    if (!file) {
        alert("Please select an image!");
        return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    try {
        const response = await fetch("./upload-avatar.php", {
            method: "POST",
            body: formData
        });

        const result = await response.json();
        if (result.status === "success") {
            // Оновлюємо обидва зображення напряму
            const profileImage = document.getElementById("user-profile__image");
            const menuImage = document.getElementById("profile-image");
            if (profileImage) {
                profileImage.src = result.image_url + "?t=" + new Date().getTime();
                console.log("Updated user-profile__image to:", result.image_url);
            }
            if (menuImage) {
                menuImage.src = result.image_url + "?t=" + new Date().getTime();
                console.log("Updated profile-image to:", result.image_url);
            }
            alert("Avatar uploaded successfully!");
        } else {
            alert("Error: " + result.message);
        }
    } catch (error) {
        console.error("Upload error:", error);
        alert("Failed to upload avatar.");
    }
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
        
        document.getElementById("user-profile__image").src = result.user_image || "images/default.png";
        document.getElementById("profile-image").src = result.user_image || "images/default.png";
        document.getElementById("profile-name").textContent = result.user_name || "Guest";

    } catch (error) {
        console.error("Session check error:", error);
    }
}