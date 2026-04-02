<?php
// Step 1: Enable requests
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Step 2: Database connectivity
require_once 'db.php';

// Check email pass kiya hai parameter set karke jaise `?email=abc@gmail.com`
if(isset($_GET['email'])) {
    
    // Step 3: Student ka email URL param se get kiya gya hai
    $email = mysqli_real_escape_string($conn, $_GET['email']);

    // Step 4: SQL join maarke opportunity aur application list select everything `applications.*`
    $query = "
        SELECT applications.*, opportunities.title, opportunities.company 
        FROM applications 
        INNER JOIN opportunities ON applications.opportunity_id = opportunities.id 
        WHERE applications.student_email = '$email'
        ORDER BY applications.id DESC
    ";

    $result = mysqli_query($conn, $query);
    $applications = array();

    if ($result) {
        // Step 5: Loop chalakar list add karo
        while($row = mysqli_fetch_assoc($result)) {
            array_push($applications, $row);
        }
    }

    echo json_encode(["status" => "success", "data" => $applications]);
} else {
    // If email was not passed
    echo json_encode(["status" => "error", "message" => "Please provide user email to fetch applications"]);
}
?>
