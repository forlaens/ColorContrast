<?php

$siteUrl = getenv('SITE_URL') ?: 'http://localhost';
$parts = parse_url($siteUrl);

$_SERVER['DOCUMENT_ROOT'] = realpath(__DIR__ . '/../app');
$_SERVER['HTTP_HOST'] = $parts['host'] ?? 'localhost';
$_SERVER['HTTPS'] = (($parts['scheme'] ?? 'http') === 'https') ? 'on' : 'off';

if (isset($parts['port'])) {
	$_SERVER['HTTP_HOST'] .= ':' . $parts['port'];
}

require $_SERVER['DOCUMENT_ROOT'] . '/index.php';
