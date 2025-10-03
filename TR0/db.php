<?php
$host = "localhost";
$user = "a24bribriera_m07"; 
$pass = "Brian12345";     
$db   = "a24bribriera_m07";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Connexió fallida: " . $conn->connect_error);   
}

$conn->set_charset("utf8");
?>