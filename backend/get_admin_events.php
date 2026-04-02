<?php
include 'db.php';
header('Content-Type: application/json');

// Step: admin ke liye events list show kar rahe hain strictly gathering count maps correctly!
$query = "
    SELECT e.*, COUNT(r.id) AS enrolled_count 
    FROM events e
    LEFT JOIN event_registrations r ON e.id = r.event_id 
    GROUP BY e.id 
    ORDER BY e.created_at DESC
";
$res = mysqli_query($conn, $query);

$adminEvents = [];
while($row = mysqli_fetch_assoc($res)) {
    $adminEvents[] = $row;
}
echo json_encode(["status" => "success", "data" => $adminEvents]);
?>
