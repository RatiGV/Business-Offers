<?php
// Business Offer lead form handler (AJAX). Set COMPANY per site.
const COMPANY = '__COMPANY__';
const MAIL_TO = 'business@smartacademy.ge';
const MAIL_FROM = 'no-reply@smartacademy.ge';
header('Content-Type: application/json; charset=utf-8');
function out($ok, $error = '')
{
    echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'error' => $error], JSON_UNESCAPED_UNICODE);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    out(false, 'Method not allowed');
}
if (!empty($_POST['website'])) {
    out(true);
}
function field($key, $max)
{
    $v = trim((string)($_POST[$key] ?? ''));
    $v = preg_replace('/[\r\n\t]+/', ' ', $v);
    return mb_substr($v, 0, $max);
}
$name = field('name', 120);
$phone = field('phone', 40);
$email = field('email', 160);
$course = field('course', 200);
if ($name === '' || $phone === '' || $course === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    out(false, 'გთხოვ, სწორად შეავსო ყველა ველი.');
}
$ip = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '';
$ip = trim(explode(',', $ip)[0]);
$device = json_decode((string)($_POST['device'] ?? ''), true);
if (!is_array($device)) {
    $device = [];
}
$device['serverUserAgent'] = $_SERVER['HTTP_USER_AGENT'] ?? '';
$e = fn($s) => htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8');
$rows = [
    'სახელი და გვარი' => $name,
    'ტელეფონი' => $phone,
    'ელ. ფოსტა' => $email,
    'სასურველი კურსი' => $course,
    'კომპანია' => COMPANY,
    'IP' => $ip,
    'გვერდი' => $_SERVER['HTTP_REFERER'] ?? '',
    'დრო' => date('Y-m-d H:i:s'),
];
foreach ($device as $k => $v) {
    $rows['Device: ' . $k] = is_scalar($v) ? $v : json_encode($v);
}
$html = '<table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">';
foreach ($rows as $k => $v) {
    $html .= '<tr><td style="border:1px solid #ddd;font-weight:bold">' . $e($k) . '</td><td style="border:1px solid #ddd">' . $e(mb_substr((string)$v, 0, 500)) . '</td></tr>';
}
$html .= '</table>';
$subject = 'Business Offer Request - ' . $name . ' - ' . COMPANY . ' - ' . $course;
$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'From: ' . COMPANY . ' Offer <' . MAIL_FROM . '>',
    'Reply-To: ' . $email,
];
$sent = mail(MAIL_TO, '=?UTF-8?B?' . base64_encode($subject) . '?=', $html, implode("\r\n", $headers));
if (!$sent) {
    http_response_code(500);
    out(false, 'გაგზავნა ვერ მოხერხდა, სცადე ხელახლა.');
}
out(true);
