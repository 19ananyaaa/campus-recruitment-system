<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");
require_once 'db.php';

$data = json_decode(file_get_contents("php://input"));
if(isset($data->email)) {
    $email = mysqli_real_escape_string($conn, $data->email);
    
    // Secure params mapped
    $skills = isset($data->skills) ? mysqli_real_escape_string($conn, $data->skills) : '';
    $cgpa = isset($data->cgpa) ? (float) $data->cgpa : 0.0;

    // Step 1: yaha hum database me student attributes (skills/cgpa) permanently update kar rahe hain
    $query = "UPDATE students SET skills='$skills', cgpa='$cgpa' WHERE email='$email'";
    $result = mysqli_query($conn, $query);

    if($result) {
        // Step 2: user ko apply success message dikha rahe hain essentially return success trace
        echo json_encode(["status" => "success", "message" => "Profile skills & metrics updated safely!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to trace profile updates logic."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Missing email footprint layer."]);
}
?>
