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
		$description = 'Choose a color from an image and check whether it stays readable or visible.';
	?>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="color-scheme" content="light dark">
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
	<link rel="manifest" href="/manifest.webmanifest">
	<link rel="mask-icon" href="/img/favicon/safari-pinned-tab.svg" color="#000000">
	<link rel="shortcut icon" href="/img/favicon/favicon.ico">
	<meta name="apple-mobile-web-app-title" content="Contrast">
	<meta name="mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-status-bar-style" content="default">
	<meta name="application-name" content="Contrast">
	<meta name="msapplication-TileColor" content="#ffffff">
	<meta name="msapplication-config" content="/img/favicon/browserconfig.xml">
	<meta name="theme-color" content="#f6f7fb" media="(prefers-color-scheme: light)">
	<meta name="theme-color" content="#080d18" media="(prefers-color-scheme: dark)">

	<script>
		(function () {
			try {
				var theme = window.localStorage.getItem('colorcontrast-theme');

				if (theme === 'dark' || theme === 'light') {
					document.documentElement.setAttribute('data-theme', theme);
				}
			} catch (error) {}
		}());
	</script>
	<link href="/css/style.css" rel="stylesheet">
</head>
<body>
