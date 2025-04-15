<?php
$host = "localhost";
$dbname = "students_db";
$username = "root";
$password = "";

$conn = new mysqli($host, $username, $password, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Помилка підключення до бази"]);
    exit;
}
?>