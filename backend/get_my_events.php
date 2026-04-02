<?php
include 'db.php';
header('Content-Type: application/json');

if (!isset($_GET['email'])) {
    echo json_encode(["status" => "error", "message" => "Missing email parameter."]);
    exit;
}

$email = mysqli_real_escape_string($conn, $_GET['email']);

// Step 1: yaha user ki sabhi registered events ka ID fetch kar rahe hain
$query = "SELECT event_id FROM event_registrations WHERE student_email='$email'";
$res = mysqli_query($conn, $query);

$registered = [];
while($row = mysqli_fetch_assoc($res)) {
    $registered[] = $row['event_id'];
}
echo json_encode(["status" => "success", "data" => $registered]);
?>
