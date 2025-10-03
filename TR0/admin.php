<?php
require_once "db.php";

//AÑADIR PREGUNTA
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST['add'])) {
    $pregunta = $_POST['pregunta'];
    $r0 = $_POST['r0'];
    $r1 = $_POST['r1'];
    $r2 = $_POST['r2'];
    $r3 = $_POST['r3'];
    $correcta = intval($_POST['correcta']);

    $imatge = null;
    if (!empty($_FILES['imatge']['name'])) {
        $directorio = "img/";
        $nombreArchivo = time() . "_" . basename($_FILES["imatge"]["name"]);
        $rutaDestino = $directorio . $nombreArchivo;
        if (move_uploaded_file($_FILES["imatge"]["tmp_name"], $rutaDestino)) {
            $imatge = $rutaDestino;
        }
    }

    $sql = "INSERT INTO preguntas (texto, r0, r1, r2, r3, correcta, imatge) 
            VALUES ('$pregunta', '$r0', '$r1', '$r2', '$r3', $correcta, " . 
            ($imatge ? "'$imatge'" : "NULL") . ")";
    $conn->query($sql);

    header("Location: admin.php?msg=ok");
    exit;
}

//EDITAR PREGUNTA
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST['update'])) {
    $id = intval($_POST['id']);
    $pregunta = $_POST['pregunta'];
    $r0 = $_POST['r0'];
    $r1 = $_POST['r1'];
    $r2 = $_POST['r2'];
    $r3 = $_POST['r3'];
    $correcta = intval($_POST['correcta']);

    $setimatge = "";
    if (!empty($_FILES['imatge']['name'])) {
        $directorio = "img/";
        $nombreArchivo = time() . "_" . basename($_FILES["imatge"]["name"]);
        $rutaDestino = $directorio . $nombreArchivo;
        if (move_uploaded_file($_FILES["imatge"]["tmp_name"], $rutaDestino)) {
            $setimatge = ", imatge='$rutaDestino'";
        }
    }

    $sql = "UPDATE preguntas 
            SET texto='$pregunta', r0='$r0', r1='$r1', r2='$r2', r3='$r3', correcta=$correcta $setimatge
            WHERE id=$id";
    $conn->query($sql);

    header("Location: admin.php?msg=updated");
    exit;
}

//ELIMINAR
if (isset($_GET['del'])) {
    $id = intval($_GET['del']);
    $conn->query("DELETE FROM preguntas WHERE id=$id");
    header("Location: admin.php?msg=deleted");
    exit;
}

//EDITAR 
$editData = null;
if (isset($_GET['edit'])) {
    $id = intval($_GET['edit']);
    $res = $conn->query("SELECT * FROM preguntas WHERE id=$id");
    if ($res && $res->num_rows > 0) {
        $editData = $res->fetch_assoc();
    }
}

//LISTADO
$preguntas = $conn->query("SELECT * FROM preguntas ORDER BY id ASC");
?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Admin Quiz</title>
<style>
    body { font-family: Arial; margin: 20px; }
    table { border-collapse: collapse; width: 100%; margin-top: 20px; }
    th, td { border: 1px solid #ccc; padding: 8px; vertical-align: top; }
    th { background: #eee; }
    img { max-width: 120px; display: block; margin-top: 5px; }
</style>
</head>
<body>
<h1>Gestión de Preguntas</h1>

<?php if (isset($_GET['msg']) && $_GET['msg'] === 'ok'): ?>
    <p style="color: green;">Pregunta añadida correctamente.</p>
<?php elseif (isset($_GET['msg']) && $_GET['msg'] === 'updated'): ?>
    <p style="color: blue;">Pregunta actualizada.</p>
<?php elseif (isset($_GET['msg']) && $_GET['msg'] === 'deleted'): ?>
    <p style="color: red;">Pregunta eliminada.</p>
<?php endif; ?>

<h2><?= $editData ? "Editar Pregunta #".$editData['id'] : "Añadir Pregunta" ?></h2>
<form method="post" enctype="multipart/form-data">
    <?php if ($editData): ?>
        <input type="hidden" name="id" value="<?= $editData['id'] ?>">
    <?php endif; ?>

    <input type="text" name="pregunta" placeholder="Texto de la pregunta" 
           value="<?= $editData ? htmlspecialchars($editData['texto']) : "" ?>" required><br><br>
    <input type="text" name="r0" placeholder="Respuesta 1" value="<?= $editData['r0'] ?? "" ?>" required><br>
    <input type="text" name="r1" placeholder="Respuesta 2" value="<?= $editData['r1'] ?? "" ?>" required><br>
    <input type="text" name="r2" placeholder="Respuesta 3" value="<?= $editData['r2'] ?? "" ?>" required><br>
    <input type="text" name="r3" placeholder="Respuesta 4" value="<?= $editData['r3'] ?? "" ?>" required><br><br>
    <label>Índice de la correcta (0-3):</label>
    <input type="number" name="correcta" min="0" max="3" 
           value="<?= $editData['correcta'] ?? "" ?>" required><br><br>
    <label>imatge:</label>
    <input type="file" name="imatge" accept="image/*"><br>
    <?php if ($editData && $editData['imatge']): ?>
        <img src="<?= $editData['imatge'] ?>" alt="img"><br>
    <?php endif; ?>
    <button type="submit" name="<?= $editData ? 'update' : 'add' ?>">
        <?= $editData ? 'Actualizar' : 'Añadir' ?>
    </button>
</form>

<h2>Listado de Preguntas</h2>
<table>
    <tr>
        <th>ID</th>
        <th>Pregunta</th>
        <th>Respuestas</th>
        <th>Correcta</th>
        <th>imatge</th>
        <th>Acciones</th>
    </tr>
    <?php while ($p = $preguntas->fetch_assoc()): ?>
        <tr>
            <td><?= $p['id'] ?></td>
            <td><?= htmlspecialchars($p['texto']) ?></td>
            <td>
                0: <?= htmlspecialchars($p['r0']) ?><br>
                1: <?= htmlspecialchars($p['r1']) ?><br>
                2: <?= htmlspecialchars($p['r2']) ?><br>
                3: <?= htmlspecialchars($p['r3']) ?>
            </td>
            <td><?= $p['correcta'] ?></td>
            <td>
                <?php if ($p['imatge']): ?>
                    <img src="<?= htmlspecialchars($p['imatge']) ?>" alt="img">
                <?php else: ?>
                    <em>Sin imatge</em>
                <?php endif; ?>
            </td>
            <td>
                <a href="?edit=<?= $p['id'] ?>">Editar</a> | 
                <a href="?del=<?= $p['id'] ?>" onclick="return confirm('¿Eliminar esta pregunta?')">Eliminar</a>
            </td>
        </tr>
    <?php endwhile; ?>
</table>
</body>
</html>
