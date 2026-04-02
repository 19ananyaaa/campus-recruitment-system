<?php
// Step 1: Same CORS setup
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Step 2: Database ko jorha hai (Connect to DB)
require_once 'db.php';

// Step 3: Saari opportunities dhundhne ki query lagana (Fetch all jobs)
$query = "SELECT * FROM opportunities ORDER BY id DESC";
$result = mysqli_query($conn, $query);

$opportunities = array(); // Ek empty array banaya result store karne ko

// Agar database table mein rows(data) mili hain
if ($result && mysqli_num_rows($result) > 0) {
    // Step 4: Loop chalakar sabhi rows ko array mein daalna
    while($row = mysqli_fetch_assoc($result)) {
        array_push($opportunities, $row);
    }
}

// Step 5: JSON format mein array frontend ko bhejna
echo json_encode(["status" => "success", "data" => $opportunities]);
?>
