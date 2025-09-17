<?php
session_start();

// Si el formulario ha sido enviado
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Leer el contenido del archivo JSON
    $jsonData = file_get_contents('dades.json');
    $questions = json_decode($jsonData, true);

    // Barajar las preguntas y seleccionar 10 aleatorias
    shuffle($questions);
    $selectedQuestions = array_slice($questions, 0, 10);

    // Guardar en variables de sesión
    $_SESSION['questions'] = $selectedQuestions;
    $_SESSION['current_question'] = 0;
    $_SESSION['score'] = 0;

    // Redirigir a la página del juego
    header('Location: pregunta.php');
    exit();
}
?>

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>joc de preguntetes</title>
</head>
<body>
    <h1>Benvingut al joc de preguntetes!</h1>
    <form method="POST">
        <button type="submit">Començar joc</button>
    </form>
</body>
</html>
