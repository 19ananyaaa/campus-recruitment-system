<?php
// Step 1: Enable multipart/form-data POST requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST"); // File upload requests must be POST!
header("Content-Type: application/json");

// Step 2: Database connectivity load
require_once 'db.php';

// Step 3: Check using $_POST variables instead of raw JSON because FormData is used
if(isset($_POST['email']) && isset($_POST['opportunity_id'])) {
    
    // Strings secure karna
    $email = mysqli_real_escape_string($conn, $_POST['email']);
    $opportunity_id = mysqli_real_escape_string($conn, $_POST['opportunity_id']);

    // Step 4: Pehle check karte hain student ne already apply kiya hai ya nahi?
    $check_query = "SELECT id FROM applications WHERE student_email='$email' AND opportunity_id='$opportunity_id'";
    $check_res = mysqli_query($conn, $check_query);

    if(mysqli_num_rows($check_res) > 0) {
        echo json_encode(["status" => "error", "message" => "You have already applied for this role!"]);
        exit;
    } 

    // Step 5: File uploading handler resume validation (PDF expected via HTML validation)
    $resume_path = "";
    if(isset($_FILES['resume']) && $_FILES['resume']['error'] == 0) {
        
        $upload_dir = 'uploads/';
        // Agar folder exist nahi krta to runtime me create kardiya jaaye! -> helps in quick setup
        if(!is_dir($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }
        
        // Randomize file name time prefix se taki overwrite na ho jaye
        $filename = time() . "_" . basename($_FILES['resume']['name']);
        $target_file = $upload_dir . $filename;
        
        // Final move transfer karna PHP buffer se directory me
        if(move_uploaded_file($_FILES['resume']['tmp_name'], $target_file)) {
            $resume_path = "uploads/" . $filename; // Relative DB save for mapping API fetching
        } else {
             // Failed file upload mapping
             echo json_encode(["status" => "error", "message" => "Failed to upload resume document."]);
             exit;
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Please upload a valid resume PDF document."]);
        exit;
    }

    // Step 6: DB execute query Applications string insert form
    // Note: status automatically picks 'Applied' via our modified schema defaults 
    $query = "INSERT INTO applications (student_email, opportunity_id, resume, status) VALUES ('$email', '$opportunity_id', '$resume_path', 'Applied')";
    
    $result = mysqli_query($conn, $query);

    if($result) {
        echo json_encode(["status" => "success", "message" => "Job Application was Successful!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Could not trace technical connection."]);
    }

} else {
    // Request params dropped natively
    echo json_encode(["status" => "error", "message" => "Invalid application request, missing components."]);
}
?>
