<?php
include 'db.php';
header('Content-Type: application/json');

$query = "SELECT * FROM events ORDER BY event_date ASC";
$res = mysqli_query($conn, $query);

$events = [];
while($row = mysqli_fetch_assoc($res)) {
    $events[] = $row;
}
echo json_encode(["status" => "success", "data" => $events]);
?>
