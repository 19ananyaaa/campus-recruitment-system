<?php
include 'db.php';
header('Content-Type: application/json');
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    $id = mysqli_real_escape_string($conn, $data->id);

    // Step: admin securely deleting events
    if (mysqli_query($conn, "DELETE FROM events WHERE id='$id'")) {
        echo json_encode(["status" => "success", "message" => "✅ Event entirely destroyed."]);
    } else {
        echo json_encode(["status" => "error", "message" => "SQL constraints locked bindings."]);
    }
} else { echo json_encode(["status" => "error", "message" => "Bad configuration logic map."]); }
?>
