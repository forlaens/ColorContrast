<?php

$width = 1200;
$height = 630;
$output = __DIR__ . '/../app/img/social-card.png';
$text = 'Color contrast image checker';

$image = imagecreatetruecolor($width, $height);

$white = imagecolorallocate($image, 255, 255, 255);
$black = imagecolorallocate($image, 17, 24, 39);

imagefilledrectangle($image, 0, 0, $width, $height, $white);

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
	$fontSize = 74;
	$box = imagettfbbox($fontSize, 0, $fontPath, $text);
	$textWidth = $box[2] - $box[0];
	$textHeight = $box[1] - $box[7];
	$x = (int) (($width - $textWidth) / 2);
	$y = (int) (($height + $textHeight) / 2);

	imagettftext($image, $fontSize, 0, $x, $y, $black, $fontPath, $text);
} else {
	$font = 5;
	$textWidth = imagefontwidth($font) * strlen($text);
	$textHeight = imagefontheight($font);
	$x = (int) (($width - $textWidth) / 2);
	$y = (int) (($height - $textHeight) / 2);

	imagestring($image, $font, $x, $y, $text, $black);
}

imagepng($image, $output, 9);

echo "Generated app/img/social-card.png\n";
