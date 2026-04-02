<?php
// Step 1: Headers set karna API CORS handle ke liye
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

// Step 2: Data link include (DB)
require_once 'db.php';

// Step 3: Frontend parameter JSON file capture karna
$data = json_decode(file_get_contents("php://input"));

if(isset($data->id)) {
    // Secure block
    $id = mysqli_real_escape_string($conn, $data->id);

    // Step 4: Job row database se delete karna
    // Foreign cascade keys linked on tables automatically handles associated applications being cleared!
    $query = "DELETE FROM opportunities WHERE id='$id'";
    $result = mysqli_query($conn, $query);

    if($result) {
        echo json_encode(["status" => "success", "message" => "Opportunity deleted permanently!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Database error during deletion."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Job ID is missing. Cannot evaluate."]);
}
?>
