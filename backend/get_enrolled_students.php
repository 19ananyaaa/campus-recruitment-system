<?php
include 'db.php';
header('Content-Type: application/json');

// Step 2: admin ko enrolled students dikha rahe hain by mapping schemas securely
$query = "
    SELECT 
        e.name AS event_name, 
        er.student_email AS email, 
        er.registered_at 
    FROM event_registrations er
    JOIN events e ON er.event_id = e.id
    ORDER BY er.registered_at DESC
";
$res = mysqli_query($conn, $query);

$list = [];
while($row = mysqli_fetch_assoc($res)) {
    $list[] = $row;
}
echo json_encode(["status" => "success", "data" => $list]);
?>
