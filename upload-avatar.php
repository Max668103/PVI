<?php
session_start();
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");
header("Expires: 0");

require_once("db.php");

// Перевірка, чи авторизований користувач
if (!isset($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

$user_id = $_SESSION["user_id"];

// Перевірка, чи надіслано файл
if (!isset($_FILES["avatar"]) || $_FILES["avatar"]["error"] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "No file uploaded or upload error"]);
    exit;
}

$file = $_FILES["avatar"];
$allowed_types = ["image/jpeg", "image/png", "image/jpg"];
$max_size = 2 * 1024 * 1024; // 2MB

// Перевірка типу файлу
if (!in_array($file["type"], $allowed_types)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Only JPEG, PNG, JPG allowed"]);
    exit;
}

// Перевірка розміру файлу
if ($file["size"] > $max_size) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "File too large. Max 2MB"]);
    exit;
}

// Створюємо папку uploads, якщо її немає
$upload_dir = "uploads/";
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0755, true);
}

// Формуємо унікальне ім’я файлу: {user_id}-avatar-{timestamp}.{ext}
$ext = pathinfo($file["name"], PATHINFO_EXTENSION);
$timestamp = microtime(true) * 1000; // Мілісекунди
$new_filename = $user_id . "-avatar-" . (int)$timestamp . "." . $ext;
$destination = $upload_dir . $new_filename;

// Видаляємо старе зображення, якщо воно існує і не є дефолтним
$stmt = $conn->prepare("SELECT image FROM students WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
if ($row = $result->fetch_assoc()) {
    $current_image = $row["image"];
    if ($current_image && $current_image !== "images/default.png" && file_exists($current_image)) {
        unlink($current_image); // Видаляємо старе зображення
    }
}
$stmt->close();

// Переміщення нового файлу
if (!move_uploaded_file($file["tmp_name"], $destination)) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to save file"]);
    exit;
}

// Оновлення бази даних
$stmt = $conn->prepare("UPDATE students SET image = ? WHERE id = ?");
$full_path = $upload_dir . $new_filename;
$stmt->bind_param("si", $full_path, $user_id);

if ($stmt->execute()) {
    // Оновлюємо сесію
    $_SESSION["user_image"] = $full_path;
    session_write_close(); // Примусово записуємо сесію

    echo json_encode([
        "status" => "success",
        "message" => "Avatar uploaded successfully",
        "image_url" => $full_path
    ]);
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to update database"]);
}

$stmt->close();
$conn->close();
?>