<?php
include 'db.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    $email = mysqli_real_escape_string($conn, $data->email);
    $event_id = mysqli_real_escape_string($conn, $data->event_id);

    // Step 1: yaha hum duplication bounds fetch verify kar rahe hain
    $checkQuery = "SELECT * FROM event_registrations WHERE student_email='$email' AND event_id='$event_id'";
    $checkRes = mysqli_query($conn, $checkQuery);

    if (mysqli_num_rows($checkRes) > 0) {
        echo json_encode(["status" => "error", "message" => "Already registered logic mapping detected!"]);
        exit;
    }

    $query = "INSERT INTO event_registrations (student_email, event_id) VALUES ('$email', '$event_id')";
    
    if (mysqli_query($conn, $query)) {
        echo json_encode(["status" => "success", "message" => "🎉 You have successfully registered!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error routing logic array."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid array trace."]);
}
?>
