<?php
// Step 1: Allow headers and specify JSON output
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

// Step 2: DB link include karna
require_once 'db.php';

// Step 3: Frontend se request data read karna
$data = json_decode(file_get_contents("php://input"));

// Check karna ki array me zaroori data aya ya nhi
if(isset($data->title) && isset($data->company)) {
    // Secure input (avoid SQL hack string bypass)
    $title = mysqli_real_escape_string($conn, $data->title);
    $company = mysqli_real_escape_string($conn, $data->company);
    
    // Naye detailed variables mapped here
    $description = isset($data->description) ? mysqli_real_escape_string($conn, $data->description) : '';
    $eligibility = isset($data->eligibility) ? mysqli_real_escape_string($conn, $data->eligibility) : '';
    $location = isset($data->location) ? mysqli_real_escape_string($conn, $data->location) : 'Remote';
    $salary = isset($data->salary) ? mysqli_real_escape_string($conn, $data->salary) : 'Not Disclosed';
    $job_type = isset($data->job_type) ? mysqli_real_escape_string($conn, $data->job_type) : 'Full-time';

    // Step 4: Admin ke new job ko database mein daalna with advanced fields mapped properly
    $query = "INSERT INTO opportunities (title, company, description, eligibility, location, salary, job_type) VALUES ('$title', '$company', '$description', '$eligibility', '$location', '$salary', '$job_type')";

    // Step 5: Query execute karna aur check lagana
    $result = mysqli_query($conn, $query);

    if ($result) {
        // Success send karenge
        echo json_encode(["status" => "success", "message" => "Opportunity added successfully!"]);
    } else {
        // Error on failure
        echo json_encode(["status" => "error", "message" => "Failed to add opportunity! Database Issue."]);
    }
} else {
    // Data incomplete hone par message
    echo json_encode(["status" => "error", "message" => "Title and company are required."]);
}
?>
