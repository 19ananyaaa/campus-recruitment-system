<?php
include 'db.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    $name = mysqli_real_escape_string($conn, trim($data->name));

    if (empty($name)) {
        echo json_encode(["status" => "error", "message" => "Category name cannot be structurally blank."]);
        exit;
    }

    $check = mysqli_query($conn, "SELECT id FROM resource_categories WHERE name = '$name'");
    if (mysqli_num_rows($check) > 0) {
        echo json_encode(["status" => "error", "message" => "Entity collision: Category already operates."]);
        exit;
    }

    $query = "INSERT INTO resource_categories (name) VALUES ('$name')";
    if (mysqli_query($conn, $query)) {
        echo json_encode(["status" => "success", "message" => "✅ Category node mapped reliably!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Logic failure on injection vector."]);
    }
} else { echo json_encode(["status" => "error", "message" => "Misconfigured requests mapping."]); }
?>
