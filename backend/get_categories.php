<?php
include 'db.php';
header('Content-Type: application/json');

$query = "SELECT * FROM resource_categories ORDER BY name ASC";
$res = mysqli_query($conn, $query);

$categories = [];
while($row = mysqli_fetch_assoc($res)) {
    $categories[] = $row;
}
echo json_encode(["status" => "success", "data" => $categories]);
?>
