<?php

$brandDir = __DIR__ . '/../app/img/brand';
$faviconDir = __DIR__ . '/../app/img/favicon';

$logoSource = $brandDir . '/logo.png';
$smallFaviconSource = $brandDir . '/favicon-16.png';

function loadPng(string $path)
{
	$image = imagecreatefrompng($path);
	if (!$image) {
		throw new RuntimeException('Could not read ' . $path);
	}
	return $image;
}

function saveScaledPng(string $source, string $target, int $size): void
{
	$sourceImage = loadPng($source);
	$sourceWidth = imagesx($sourceImage);
	$sourceHeight = imagesy($sourceImage);

	$targetImage = imagecreatetruecolor($size, $size);
	imagealphablending($targetImage, false);
	imagesavealpha($targetImage, true);
	$transparent = imagecolorallocatealpha($targetImage, 0, 0, 0, 127);
	imagefilledrectangle($targetImage, 0, 0, $size, $size, $transparent);

	imagecopyresampled(
		$targetImage,
		$sourceImage,
		0,
		0,
		0,
		0,
		$size,
		$size,
		$sourceWidth,
		$sourceHeight
	);

	imagepng($targetImage, $target, 9);
}

function drawCenteredLogo($targetImage, string $source, int $x, int $y, int $size): void
{
	$sourceImage = loadPng($source);
	imagecopyresampled(
		$targetImage,
		$sourceImage,
		$x,
		$y,
		0,
		0,
		$size,
		$size,
		imagesx($sourceImage),
		imagesy($sourceImage)
	);
}

function saveSocialCard(string $logoSource, string $target): void
{
	$width = 1200;
	$height = 630;
	$image = imagecreatetruecolor($width, $height);

	$background = imagecolorallocate($image, 246, 247, 251);
	$panel = imagecolorallocate($image, 255, 255, 255);
	$border = imagecolorallocate($image, 222, 226, 234);

	imagefilledrectangle($image, 0, 0, $width, $height, $background);
	imagefilledrectangle($image, 220, 76, 980, 554, $panel);
	imagerectangle($image, 220, 76, 980, 554, $border);

	drawCenteredLogo($image, $logoSource, 420, 135, 360);

	imagepng($image, $target, 9);
}

if (!is_file($logoSource) || !is_file($smallFaviconSource)) {
	throw new RuntimeException('Missing brand image sources in app/img/brand.');
}

copy($smallFaviconSource, $faviconDir . '/favicon-16x16.png');
saveScaledPng($logoSource, $faviconDir . '/favicon-32x32.png', 32);
saveScaledPng($logoSource, $faviconDir . '/favicon-48x48.png', 48);
saveScaledPng($logoSource, $faviconDir . '/favicon-64x64.png', 64);
saveScaledPng($logoSource, $faviconDir . '/apple-touch-icon.png', 180);
saveScaledPng($logoSource, $faviconDir . '/android-chrome-192x192.png', 192);
saveScaledPng($logoSource, $faviconDir . '/android-chrome-512x512.png', 512);
saveSocialCard($logoSource, __DIR__ . '/../app/img/social-card.png');

echo "Generated favicon and social assets\n";
