<?php
include 'db.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    $title = mysqli_real_escape_string($conn, $data->title);
    $category_id = (int) $data->category_id;
    $link = mysqli_real_escape_string($conn, $data->link);

    $query = "INSERT INTO resources (title, category_id, link) VALUES ('$title', $category_id, '$link')";
    if (mysqli_query($conn, $query)) {
        echo json_encode(["status" => "success", "message" => "✅ Resource attached structurally."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Node sync algorithm failure."]);
    }
} else { echo json_encode(["status" => "error", "message" => "Invalid string headers."]); }
?>
