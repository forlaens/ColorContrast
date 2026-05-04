<!DOCTYPE html>
<html lang="en">
<head>
	<?php
		$isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
			|| (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
		$scheme = $isHttps ? 'https' : 'http';
		$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
		$baseUrl = $scheme . '://' . $host;
		$pageUrl = $baseUrl . '/';
		$socialImageUrl = $baseUrl . '/img/social-card.png';
		$title = 'Image contrast checker';
		$description = 'Upload an image and highlight areas that do not meet WCAG contrast targets.';
	?>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title><?php echo htmlspecialchars($title, ENT_QUOTES, 'UTF-8'); ?></title>
	<meta name="description" content="<?php echo htmlspecialchars($description, ENT_QUOTES, 'UTF-8'); ?>">

	<meta property="og:type" content="website">
	<meta property="og:url" content="<?php echo htmlspecialchars($pageUrl, ENT_QUOTES, 'UTF-8'); ?>">
	<meta property="og:title" content="<?php echo htmlspecialchars($title, ENT_QUOTES, 'UTF-8'); ?>">
	<meta property="og:description" content="<?php echo htmlspecialchars($description, ENT_QUOTES, 'UTF-8'); ?>">
	<meta property="og:image" content="<?php echo htmlspecialchars($socialImageUrl, ENT_QUOTES, 'UTF-8'); ?>">
	<meta property="og:image:type" content="image/png">
	<meta property="og:image:width" content="1200">
	<meta property="og:image:height" content="630">

	<meta name="twitter:card" content="summary_large_image">
	<meta name="twitter:title" content="<?php echo htmlspecialchars($title, ENT_QUOTES, 'UTF-8'); ?>">
	<meta name="twitter:description" content="<?php echo htmlspecialchars($description, ENT_QUOTES, 'UTF-8'); ?>">
	<meta name="twitter:image" content="<?php echo htmlspecialchars($socialImageUrl, ENT_QUOTES, 'UTF-8'); ?>">

	<link rel="apple-touch-icon" sizes="180x180" href="/img/favicon/apple-touch-icon.png">
	<link rel="icon" type="image/png" sizes="32x32" href="/img/favicon/favicon-32x32.png">
	<link rel="icon" type="image/png" sizes="16x16" href="/img/favicon/favicon-16x16.png">
	<link rel="icon" type="image/png" sizes="48x48" href="/img/favicon/favicon-48x48.png">
	<link rel="icon" type="image/png" sizes="64x64" href="/img/favicon/favicon-64x64.png">
	<link rel="manifest" href="/manifest.webmanifest">
	<meta name="apple-mobile-web-app-title" content="Contrast">
	<meta name="mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-status-bar-style" content="default">
	<meta name="application-name" content="Contrast">
	<meta name="msapplication-TileColor" content="#ffffff">
	<meta name="theme-color" content="#f6f7fb">

	<link href="/css/style.css" rel="stylesheet">
</head>
<body>
