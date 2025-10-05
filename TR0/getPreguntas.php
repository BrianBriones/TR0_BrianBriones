<?php

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET');
require_once "db.php";

$n = isset($_GET['n']) ? intval($_GET['n']) : 5;

// Obtener preguntas aleatorias
$sql = "SELECT * FROM preguntas ORDER BY RAND() LIMIT $n";
$result = $conn->query($sql);

$preguntas = [];

while ($row = $result->fetch_assoc()) {
    $respostes = [];
    for ($i = 0; $i < 4; $i++) {
        $respostes[] = [
            "id" => $i,
            "resposta" => $row["r$i"]
        ];
    }

    $preguntas[] = [
        "id" => $row['id'],
        "pregunta" => $row['texto'],
        "respostes" => $respostes,
        "imatge" => $row["imatge"]
    ];
}

echo json_encode($preguntas, JSON_UNESCAPED_UNICODE);
?>
