<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require_once 'db.php';

if(isset($_GET['email'])) {
    $email = mysqli_real_escape_string($conn, $_GET['email']);
    
    // Step 1: yaha user ki details database se fetch ho rahi hain
    $query = "SELECT email, role, skills, cgpa FROM students WHERE email='$email'";
    $result = mysqli_query($conn, $query);
    
    if($result && mysqli_num_rows($result) > 0) {
        $row = mysqli_fetch_assoc($result);
        
        // Step 2: Check karte hain ki kya candidate ne abhi tak koi resume database me attached bheja hai?
        $resume_query = "SELECT resume FROM applications WHERE student_email='$email' ORDER BY id DESC LIMIT 1";
        $resume_res = mysqli_query($conn, $resume_query);
        $has_resume = false;
        if($resume_res && mysqli_num_rows($resume_res) > 0) {
             $resume_row = mysqli_fetch_assoc($resume_res);
             if(!empty($resume_row['resume'])) $has_resume = true;
        }

        echo json_encode([
            "status" => "success", 
            "data" => [
                "email" => $row['email'],
                "role" => $row['role'],
                "skills" => $row['skills'],
                "cgpa" => $row['cgpa'],
                "has_resume" => $has_resume
            ]
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "User record not mapped safely."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Please pass an email trace tag."]);
}
?>
