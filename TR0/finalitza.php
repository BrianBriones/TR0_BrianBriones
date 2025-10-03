<?php
header('Content-Type: application/json; charset=utf-8');
require_once "db.php";


$input = json_decode(file_get_contents("php://input"), true);

$preguntesFront = $input['preguntes'] ?? [];
$respostes = $input['respostes'] ?? [];

$total = 0;
$correctes = 0;
$detall = [];

foreach ($preguntesFront as $i => $pf) {
    $preguntaId = intval($pf['id']);
    $respostaUsuariIndex = $respostes[$i] ?? null;

    // Recuperar la pregunta de la BD
    $sql = "SELECT * FROM preguntas WHERE id = $preguntaId";
    $result = $conn->query($sql);
    if (!$result || $result->num_rows === 0) continue;

    $pOriginal = $result->fetch_assoc();

    $respuestas = [$pOriginal['r0'], $pOriginal['r1'], $pOriginal['r2'], $pOriginal['r3']];
    $indexCorrecta = $pOriginal['correcta'];

    $respostaUsuariTxt = $respostaUsuariIndex !== null ? $respuestas[$respostaUsuariIndex] : null;
    $respostaCorrectaTxt = $respuestas[$indexCorrecta];

    $esCorrecta = ($respostaUsuariIndex !== null && $respostaUsuariIndex == $indexCorrecta);

    $detall[] = [
        'pregunta' => $pOriginal['texto'],
        "imatge" => $pOriginal["imatge"],
        'respostaUsuari' => $respostaUsuariTxt,
        'respostaCorrecta' => $respostaCorrectaTxt,
        'correcta' => $esCorrecta
    ];

    if ($respostaUsuariIndex !== null) {
        $total++;
        if ($esCorrecta) $correctes++;
    }
}

echo json_encode(['total' => $total, 'correctes' => $correctes, 'detall' => $detall], JSON_UNESCAPED_UNICODE);
?>
