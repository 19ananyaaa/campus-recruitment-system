<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

require_once 'db.php';

$data = json_decode(file_get_contents("php://input"));

if(isset($data->id) && isset($data->title) && isset($data->company)) {
    $id = intval($data->id);
    $title = mysqli_real_escape_string($conn, $data->title);
    $company = mysqli_real_escape_string($conn, $data->company);
    $description = isset($data->description) ? mysqli_real_escape_string($conn, $data->description) : '';
    $eligibility = isset($data->eligibility) ? mysqli_real_escape_string($conn, $data->eligibility) : '';
    $location = isset($data->location) ? mysqli_real_escape_string($conn, $data->location) : '';
    $salary = isset($data->salary) ? mysqli_real_escape_string($conn, $data->salary) : '';
    $job_type = isset($data->job_type) ? mysqli_real_escape_string($conn, $data->job_type) : '';

    $query = "UPDATE opportunities SET title='$title', company='$company', description='$description', eligibility='$eligibility', location='$location', salary='$salary', job_type='$job_type' WHERE id=$id";
    $result = mysqli_query($conn, $query);

    if ($result) {
        echo json_encode(["status" => "success", "message" => "Opportunity successfully updated!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to update opportunity in database."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Incomplete data provided."]);
}
?>
