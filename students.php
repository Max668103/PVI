<?php
session_start();
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0"); // Заборона кешування
header("Pragma: no-cache"); // Для сумісності зі старими браузерами
header("Expires: 0"); // Негайне закінчення терміну дії

require_once("db.php");

function validateStudentInput($input) {
    global $conn;

    $requiredFields = ["group", "firstName", "lastName", "gender", "birthday"];
    foreach ($requiredFields as $field) {
        if (!isset($input[$field]) || trim($input[$field]) === "") {
            http_response_code(400);
            echo json_encode(["error" => "Поле '$field' обов'язкове."]);
            exit;
        }
    }

    // Уникаємо дублювання студента з тим самим ім'ям, прізвищем і датою народження
    $stmt = $conn->prepare("SELECT id FROM students WHERE firstName = ? AND lastName = ? AND birthday = ?");
    $stmt->bind_param("sss", $input["firstName"], $input["lastName"], $input["birthday"]);
    $stmt->execute();
    $stmt->store_result();

    // Додатково: якщо це оновлення (PUT), дозволити, якщо збігається з тим самим ID
    if ($stmt->num_rows > 0) {
        if ($_SERVER["REQUEST_METHOD"] === "PUT" && isset($input["id"])) {
            $stmt->bind_result($existingId);
            while ($stmt->fetch()) {
                if ((int)$existingId !== (int)$input["id"]) {
                    http_response_code(400);
                    echo json_encode(["error" => "Student with this name and birthday already exist!"]);
                    exit;
                }
            }
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Student with this name and birthday already exist!"]);
            exit;
        }
    }
}


$method = $_SERVER["REQUEST_METHOD"];

if (!isset($_SESSION["user_id"]) && $method !== "OPTIONS") {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

switch ($method) {
    case "GET":
        $result = $conn->query("SELECT * FROM students");
        $students = [];
        while ($row = $result->fetch_assoc()) {
            $students[] = [
                "id" => (int)$row["id"],
                "group" => $row["group_name"],
                "firstName" => $row["firstName"],
                "lastName" => $row["lastName"],
                "gender" => $row["gender"],
                "birthday" => $row["birthday"],
                "status" => $row["status"] ?? "inactive" // на випадок якщо ще не всі студенти мають статус
            ];
            
        }

        // Отримуємо user_image із бази даних
        $user_image = "images/default.png";
        if (isset($_SESSION["user_id"])) {
            $stmt = $conn->prepare("SELECT image FROM students WHERE id = ?");
            $stmt->bind_param("i", $_SESSION["user_id"]);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($row = $result->fetch_assoc()) {
                $user_image = $row["image"] ?? "images/default.png";
            }
            $stmt->close();
        }

        echo json_encode([
            "students" => $students,
            "user_name" => $_SESSION["user_name"] ?? null,
            "user_image" => $user_image
        ]);
        break;
    

    case "POST":
        $input = json_decode(file_get_contents("php://input"), true);
        validateStudentInput($input);
        $stmt = $conn->prepare("INSERT INTO students (group_name, firstName, lastName, gender, birthday) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("sssss", $input["group"], $input["firstName"], $input["lastName"], $input["gender"], $input["birthday"]);
        if ($stmt->execute()) {
            $input["id"] = $conn->insert_id;
            echo json_encode($input);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Помилка додавання"]);
        }
        break;

    case "PUT":
        $input = json_decode(file_get_contents("php://input"), true);
        validateStudentInput($input);
        $stmt = $conn->prepare("UPDATE students SET group_name = ?, firstName = ?, lastName = ?, gender = ?, birthday = ? WHERE id = ?");
        $stmt->bind_param("sssssi", $input["group"], $input["firstName"], $input["lastName"], $input["gender"], $input["birthday"], $input["id"]);
        if ($stmt->execute()) {
            echo json_encode(["message" => "Student updated"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Помилка оновлення"]);
        }
        break;

    case "DELETE":
        parse_str(file_get_contents("php://input"), $data);
        $id = intval($data["id"] ?? -1);
        $stmt = $conn->prepare("DELETE FROM students WHERE id = ?");
        $stmt->bind_param("i", $id);
        if ($stmt->execute()) {
            echo json_encode(["message" => "Student deleted"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Помилка видалення"]);
        }
        break;

    case "OPTIONS":
        http_response_code(200);
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Метод не дозволений"]);
}
?>