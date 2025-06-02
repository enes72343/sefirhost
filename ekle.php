<?php
// MySQL bağlantı bilgileri
$host = "localhost";
$user = "root"; // XAMPP kullanıyorsan root olur
$password = "enes1717"; // XAMPP'da şifresiz
$database = "mta_sw";

// Bağlantı oluştur
$conn = mysqli_connect($host, $user, $password, $database);

// Bağlantıyı kontrol et
if (!$conn) {
    die("Bağlantı hatası: " . mysqli_connect_error());
}

// Formdan gelen verileri al
$ad = $_POST['ad'];
$soyad = $_POST['soyad'];
$yas = $_POST['yas'];

// SQL sorgusu
$sql = "INSERT INTO ogrenciler (ad, soyad, yas) VALUES ('$ad', '$soyad', '$yas')";

// Sorguyu çalıştır
if (mysqli_query($conn, $sql)) {
    echo "Kayıt başarıyla eklendi.";
} else {
    echo "Hata: " . mysqli_error($conn);
}

mysqli_close($conn);
?>
