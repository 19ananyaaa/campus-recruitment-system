<?php
include 'db.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    $name = mysqli_real_escape_string($conn, $data->name);
    $event_date = mysqli_real_escape_string($conn, $data->date);
    $description = mysqli_real_escape_string($conn, $data->description);

    $query = "INSERT INTO events (name, event_date, description) VALUES ('$name', '$event_date', '$description')";
    if (mysqli_query($conn, $query)) {
        echo json_encode(["status" => "success", "message" => "✅ Event initialized securely!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Database failure mappings."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid trace mode."]);
}
?>
