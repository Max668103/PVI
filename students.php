<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$filename = "data.json";

// Створити файл, якщо його ще нема
if (!file_exists($filename)) {
    file_put_contents($filename, json_encode([]));
}

// Отримати масив студентів із файлу
function readStudents() {
    global $filename;
    return json_decode(file_get_contents($filename), true);
}

// Зберегти масив студентів у файл
function saveStudents($students) {
    global $filename;
    file_put_contents($filename, json_encode($students, JSON_PRETTY_PRINT));
}

// Обробка запитів
$method = $_SERVER["REQUEST_METHOD"];

switch ($method) {
    case "GET":
        echo json_encode(readStudents());
        break;

    case "POST":
        $input = json_decode(file_get_contents("php://input"), true);
        $students = readStudents();

        // Автоматично додаємо ID
        $input["id"] = count($students);
        $students[] = $input;

        saveStudents($students);
        echo json_encode($input);
        break;

    case "PUT":
        $input = json_decode(file_get_contents("php://input"), true);
        $students = readStudents();

        foreach ($students as &$student) {
            if ($student["id"] == $input["id"]) {
                $student = array_merge($student, $input);
                break;
            }
        }

        saveStudents($students);
        echo json_encode(["message" => "Student updated"]);
        break;

    case "DELETE":
        parse_str(file_get_contents("php://input"), $data);
        $idToDelete = intval($data["id"] ?? -1);

        $students = readStudents();
        $students = array_values(array_filter($students, fn($s) => $s["id"] != $idToDelete));

        // Перегенеруємо ID
        foreach ($students as $index => &$student) {
            $student["id"] = $index;
        }

        saveStudents($students);
        echo json_encode(["message" => "Student deleted"]);
        break;

    case "OPTIONS":
        // Preflight для CORS
        http_response_code(200);
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
}
