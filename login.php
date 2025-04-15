<?php
session_start();
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

require_once("db.php");

$input = json_decode(file_get_contents("php://input"), true);
$firstName = $input["firstName"] ?? "";
$lastName = $input["lastName"] ?? "";
$password = $input["password"] ?? "";

$stmt = $conn->prepare("SELECT * FROM students WHERE firstName = ? AND lastName = ? AND birthday = ?");
$stmt->bind_param("sss", $firstName, $lastName, $password);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    $_SESSION["user_id"] = $row["id"];
    $_SESSION["user_name"] = $row["firstName"] . " " . $row["lastName"];
    $_SESSION["user_image"] = $row["image"] ?? "image/default.png";

    // Оновлення статусу в базі
    $updateStatus = $conn->prepare("UPDATE students SET status = 'active' WHERE id = ?");
    $updateStatus->bind_param("i", $row["id"]);
    $updateStatus->execute();

    echo json_encode([
        "status" => "success",
        "id" => $row["id"],
        "name" => $_SESSION["user_name"],
        "image" => $_SESSION["user_image"] 
    ]);
} else {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Student not found"]);
}
?>