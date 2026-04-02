<?php
// Step 1: API Headers set karna (Taki frontend backend se connect kar sake bina error ke)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

// Step 2: Database connection file ko include karna (Connecting to DB)
require_once 'db.php';

// Step 3: Frontend se JSON data read karna (Getting JSON input)
$data = json_decode(file_get_contents("php://input"));

// Step 4: Check karna ki data theek se aaya hai ya nahi
if(isset($data->email) && isset($data->password)) {
    // Data ko variables mein safely store karna (SQL injection se bachne ke liye)
    $email = mysqli_real_escape_string($conn, $data->email);
    
    // Password ko secure (hash) karna (Basic security for passwords)
    $password = password_hash($data->password, PASSWORD_DEFAULT);

    // Step 5: Check karna ki email pehle se exist karta hai ya nahi
    $check_query = "SELECT id FROM students WHERE email='$email'";
    $check_res = mysqli_query($conn, $check_query);

    if (mysqli_num_rows($check_res) > 0) {
        // Agar email already database mein hai
        echo json_encode(["status" => "error", "message" => "Email already exists! Please login."]);
    } else {
        // Step 6: Naya user database mein insert karna (Registering user)
        $query = "INSERT INTO students (email, password) VALUES ('$email', '$password')";
        $result = mysqli_query($conn, $query);

        if ($result) {
            // Success response frontend ko bhejna
            echo json_encode(["status" => "success", "message" => "Signup successful! You can login now."]);
        } else {
            // Error response bhejna jab insert properly na ho
            echo json_encode(["status" => "error", "message" => "Database error, failed to register."]);
        }
    }
} else {
    // Agar data missing ho toh
    echo json_encode(["status" => "error", "message" => "Email and password are required"]);
}
?>
