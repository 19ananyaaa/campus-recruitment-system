<?php
// Step 1: Set headers (Allows admin panel to read stats via Fetch API)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Step 2: Database connectivity
require_once 'db.php';

// Step 3: Admin saari applications dekh raha hai pures track mapping se
$query = "
    SELECT applications.*, opportunities.title, opportunities.company 
    FROM applications 
    INNER JOIN opportunities ON applications.opportunity_id = opportunities.id
    ORDER BY applications.id DESC
";

$result = mysqli_query($conn, $query);
$apps = array();

if ($result && mysqli_num_rows($result) > 0) {
    // Step 4: Sab results ko ek array list mein ikhatta karna
    while($row = mysqli_fetch_assoc($result)) {
        array_push($apps, $row);
    }
}

// Step 5: JSON file bhej di frontend `script.js` ko show karne ke liye
echo json_encode(["status" => "success", "data" => $apps]);
?>
