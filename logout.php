<?php
session_start();

require_once("db.php");

if (isset($_SESSION["user_id"])) {
    $stmt = $conn->prepare("UPDATE students SET status = 'inactive' WHERE id = ?");
    $stmt->bind_param("i", $_SESSION["user_id"]);
    $stmt->execute();
}

session_unset();
session_destroy();

header("Content-Type: application/json");
echo json_encode(["status" => "logged_out"]);
?>