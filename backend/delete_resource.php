<?php
include 'db.php';
header('Content-Type: application/json');
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    $id = mysqli_real_escape_string($conn, $data->id);

    // Step: admin permanently purging resources logically
    if (mysqli_query($conn, "DELETE FROM resources WHERE id='$id'")) {
        echo json_encode(["status" => "success", "message" => "✅ Resource archive deleted globally."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Node sync failure locked bounds."]);
    }
} else { echo json_encode(["status" => "error", "message" => "Invalid POST structure array."]); }
?>
