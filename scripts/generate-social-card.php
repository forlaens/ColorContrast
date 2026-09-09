<?php

$width = 1200;
$height = 630;
$output = __DIR__ . '/../app/img/social-card.png';
$lines = ['Forlæns', 'Color Contrast Checker'];

$image = imagecreatetruecolor($width, $height);

$cream = imagecolorallocate($image, 255, 250, 244);
$blue = imagecolorallocate($image, 16, 47, 73);

imagefilledrectangle($image, 0, 0, $width, $height, $blue);

$fontPaths = [
	'/System/Library/Fonts/Supplemental/Arial Bold.ttf',
	'/System/Library/Fonts/Supplemental/Arial.ttf',
	'/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
	'/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf',
];

$fontPath = null;
foreach ($fontPaths as $candidate) {
	if (is_readable($candidate)) {
		$fontPath = $candidate;
		break;
	}
}

if ($fontPath && function_exists('imagettftext')) {
	$fontSize = 96;
	$lineGap = 28;
	$maxTextWidth = $width - 180;

	do {
		$boxes = array_map(fn($line) => imagettfbbox($fontSize, 0, $fontPath, $line), $lines);
		$lineWidths = array_map(fn($box) => $box[2] - $box[0], $boxes);
		$lineHeights = array_map(fn($box) => $box[1] - $box[7], $boxes);
		$widestLine = max($lineWidths);
		$totalHeight = array_sum($lineHeights) + $lineGap;

		if ($widestLine <= $maxTextWidth || $fontSize <= 48) {
			break;
		}

		$fontSize -= 4;
	} while (true);

	$y = (int) (($height - $totalHeight) / 2);

	foreach ($lines as $index => $line) {
		$x = (int) (($width - $lineWidths[$index]) / 2);
		$baseline = $y + $lineHeights[$index];
		imagettftext($image, $fontSize, 0, $x, $baseline, $cream, $fontPath, $line);
		$y = $baseline + $lineGap;
	}
} else {
	$font = 5;
	$textHeight = imagefontheight($font);
	$totalHeight = (count($lines) * $textHeight) + 12;
	$y = (int) (($height - $totalHeight) / 2);

	foreach ($lines as $line) {
		$textWidth = imagefontwidth($font) * strlen($line);
		$x = (int) (($width - $textWidth) / 2);
		imagestring($image, $font, $x, $y, $line, $cream);
		$y += $textHeight + 12;
	}
}

imagepng($image, $output, 9);

echo "Generated app/img/social-card.png\n";
