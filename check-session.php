<?php
session_start();
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
echo json_encode(["logged_in" => isset($_SESSION["user_id"])]);
?>