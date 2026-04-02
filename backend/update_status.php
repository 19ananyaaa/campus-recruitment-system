<?php
// Step 1: Request headers set karna 
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

// Step 2: Database se connection build karna
require_once 'db.php';

// Step 3: Admin request ko decode kro
$data = json_decode(file_get_contents("php://input"));

// Check if request structure is valid
if(isset($data->id) && isset($data->status)) {
    // Strings secure karo id aur status input
    $id = mysqli_real_escape_string($conn, $data->id);
    $status = mysqli_real_escape_string($conn, $data->status);

    // Advanced interview fields fetch mapping
    $interview_date = isset($data->interview_date) ? mysqli_real_escape_string($conn, $data->interview_date) : '';
    $interview_time = isset($data->interview_time) ? mysqli_real_escape_string($conn, $data->interview_time) : '';
    $interview_mode = isset($data->interview_mode) ? mysqli_real_escape_string($conn, $data->interview_mode) : '';
    $message = isset($data->message) ? mysqli_real_escape_string($conn, $data->message) : '';

    // Step 4: yaha candidate ka naya status backend se update ho raha hai database array me
    if($status === 'Interview') {
        $query = "UPDATE applications SET status='$status', interview_date='$interview_date', interview_time='$interview_time', interview_mode='$interview_mode', message='$message' WHERE id='$id'";
    } else {
        $query = "UPDATE applications SET status='$status' WHERE id='$id'";
    }
    
    $result = mysqli_query($conn, $query);

    if($result) {
        // Updated
        echo json_encode(["status" => "success", "message" => "Application status updated successfully!"]);
    } else {
        // Failed
        echo json_encode(["status" => "error", "message" => "Could not update status due to database mapping setup."]);
    }
} else {
    // Invalid request params
    echo json_encode(["status" => "error", "message" => "Invalid request details. Cannot schedule without IDs."]);
}
?>
