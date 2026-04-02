<?php
// Step 1: API Headers set karna (Taki API access ho sake properly)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

// Step 2: Database connection (DB ko link karna)
require_once 'db.php';

// Step 3: Frontend se data receive karna (Read JSON data from JS fetch)
$data = json_decode(file_get_contents("php://input"));

// Agar user ne email aur password bheja hai tabhi aage badhenge
if(isset($data->email) && isset($data->password)) {
    
    // Variables define karna
    $email = mysqli_real_escape_string($conn, $data->email);
    $password_input = $data->password;

    // Step 4: Admin ke liye ek special hardcoded login banana (Admin dashboard check)
    if ($email === "admin@campus.com" && $password_input === "admin123") {
        echo json_encode(["status" => "success", "message" => "Admin login successful", "role" => "admin"]);
        exit; // Admin logged in, script yahin stop karenge
    }

    // Step 5: Student ki details database mein dhundhna (Fetch student record)
    $query = "SELECT * FROM students WHERE email='$email'";
    $result = mysqli_query($conn, $query);

    // Agar hume row milta hai (User exists)
    if (mysqli_num_rows($result) > 0) {
        // Data array format me lena
        $row = mysqli_fetch_assoc($result);
        
        // Step 6: Entered password ko hashed password se match karna
        if (password_verify($password_input, $row['password'])) {
            // Password sahi hai
            // Step 7: Database me array query mark krke role dynamic detect kare
            $role = isset($row['role']) ? $row['role'] : 'student';
            echo json_encode(["status" => "success", "message" => "Login successful", "role" => $role]);
        } else {
            // Password galat hai
            echo json_encode(["status" => "error", "message" => "Incorrect password! Please try again."]);
        }
    } else {
        // Agar user ka account hi nahi hai
        echo json_encode(["status" => "error", "message" => "Account not found! Please sign up first."]);
    }
} else {
    // Agar credentials incomplete the
    echo json_encode(["status" => "error", "message" => "Please enter complete details."]);
}
?>
