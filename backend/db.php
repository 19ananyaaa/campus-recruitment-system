<?php
// Step 1: Database details define karna (Database connection info)
$servername = "localhost";
$username = "root"; // XAMPP default username
$password = ""; // XAMPP default empty password
$database = "campus_hub"; // Hamare database ka naam

// Step 2: Database se connection banana (Creating connection via mysqli)
mysqli_report(MYSQLI_REPORT_OFF); // Disable automatic exceptions to safely output JSON errors!
$conn = mysqli_connect($servername, $username, $password, $database);

// Step 3: Connection check karna (Check if connection is successful)
if (!$conn) {
    // Agar fail ho jaye toh error show karenge
    die("Connection failed: " . mysqli_connect_error());
}
?>
