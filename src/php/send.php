<?php 
    // Файлы phpmailer
    require 'PHPMailer.php';
    require 'SMTP.php';
    require 'Exception.php';

    // Переменные, которые отправляет пользователь
    $name = $_POST['username'];
    $email = $_POST['email-address'];
    $text = $_POST['text'];
    $file = $_FILES['myfile'];

    // Формирование самого письма
    $title = "Заявка от клиента с сайта по продаже участка";
    $body = "
    <h2>Заявка</h2>
    <b>Имя:</b> $name<br>
    <b>Почта:</b> $email<br>
    <b>Ссылка на сайт с формой: </b><a href='http://hostname.ru'>hostname.ru</a><br><br>
    <b>Сообщение:</b><br> 
    <pre>$text</pre>
    ";

    // Настройки PHPMailer
    $mail = new PHPMailer\PHPMailer\PHPMailer();
    try {
        $mail->isSMTP();   
        $mail->CharSet = "UTF-8";
        $mail->SMTPAuth   = true;
        //$mail->SMTPDebug = 2;
        $mail->Debugoutput = function($str, $level) {$GLOBALS['status'][] = $str;};

        // Настройки вашей почты
        $mail->Host       = 'smtp.email.ru'; // SMTP сервера вашей почты
        $mail->Username   = 'user@email.ru'; // Логин на почте
        $mail->Password   = 'mail_password'; // Пароль на почте
        $mail->SMTPSecure = 'ssl';
        $mail->Port       = 465;
        $mail->setFrom('user@email.ru', 'Sender name'); // Адрес самой почты и имя отправителя

        // Получатели письма
        $mail->addAddress('user1@email.ru');  
        $mail->addAddress('user2@email.ru'); 
        $mail->addAddress('user3@email.ru');

        // Прикрепление файлов к письму
    if (!empty($file['name'][0])) {
        for ($ct = 0; $ct < count($file['tmp_name']); $ct++) {
            $uploadfile = tempnam(sys_get_temp_dir(), sha1($file['name'][$ct]));
            $filename = $file['name'][$ct];
            if (move_uploaded_file($file['tmp_name'][$ct], $uploadfile)) {
                $mail->addAttachment($uploadfile, $filename);
                $rfile[] = "Файл $filename прикреплён";
            } else {
                $rfile[] = "Не удалось прикрепить файл $filename";
            }
        }   
    }
    // Отправка сообщения
    $mail->isHTML(true);
    $mail->Subject = $title;
    $mail->Body = $body;    

    // Проверяем отравленность сообщения
    if ($mail->send()) {$result = "success";} 
    else {$result = "error";}

    } catch (Exception $e) {
        $result = "error";
        $status = "Сообщение не было отправлено. Причина ошибки: {$mail->ErrorInfo}";
    }

    // Отображение результата
    echo json_encode(["result" => $result, "resultfile" => $rfile, "status" => $status]);

?>