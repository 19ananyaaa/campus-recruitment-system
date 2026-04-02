<?php
include 'db.php';
header('Content-Type: application/json');

$query = "SELECT resources.id, resources.title, resources.link, resources.created_at, resource_categories.name as category FROM resources LEFT JOIN resource_categories ON resources.category_id = resource_categories.id ORDER BY resources.id DESC";
$res = mysqli_query($conn, $query);

$nodes = [];
while($row = mysqli_fetch_assoc($res)) {
    $nodes[] = $row;
}
echo json_encode(["status" => "success", "data" => $nodes]);
?>
