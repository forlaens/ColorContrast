<?php

$width = 1200;
$height = 630;
$output = __DIR__ . '/../app/img/social-card.png';

$image = imagecreatetruecolor($width, $height);

$white = imagecolorallocate($image, 255, 255, 255);
$black = imagecolorallocate($image, 0, 0, 0);
$gray = imagecolorallocate($image, 240, 240, 240);
$midGray = imagecolorallocate($image, 176, 176, 176);
$purple = imagecolorallocate($image, 119, 40, 237);
$red = imagecolorallocate($image, 225, 31, 31);

imagefilledrectangle($image, 0, 0, $width, $height, $white);

$tile = 52;
$checkerX = 720;
$checkerY = 118;
$checkerW = 340;
$checkerH = 340;

imagefilledrectangle($image, $checkerX, $checkerY, $checkerX + $checkerW, $checkerY + $checkerH, $gray);

for ($y = $checkerY; $y < $checkerY + $checkerH; $y += $tile) {
	for ($x = $checkerX; $x < $checkerX + $checkerW; $x += $tile) {
		$column = intdiv($x - $checkerX, $tile);
		$row = intdiv($y - $checkerY, $tile);

		if (($column + $row) % 2 === 0) {
			imagefilledrectangle($image, $x, $y, $x + $tile - 1, $y + $tile - 1, $midGray);
		}
	}
}

imagefilledellipse($image, 890, 288, 170, 170, $black);
imagefilledellipse($image, 890, 288, 112, 112, $white);
imagefilledellipse($image, 890, 288, 46, 46, $purple);
imageline($image, 890, 174, 890, 402, $black);
imageline($image, 776, 288, 1004, 288, $black);

imagefilledrectangle($image, 138, 414, 524, 468, $black);
imagefilledrectangle($image, 524, 414, 612, 468, $red);

$fontLarge = 5;
$fontMedium = 4;
$fontSmall = 3;

imagestring($image, $fontLarge, 140, 150, 'Image contrast checker', $black);
imagestring($image, $fontMedium, 142, 204, 'Find WCAG contrast issues', $black);
imagestring($image, $fontMedium, 142, 230, 'directly in uploaded images.', $black);
imagestring($image, $fontSmall, 142, 432, '4.5:1', $white);
imagestring($image, $fontSmall, 536, 432, 'fail', $white);

imagerectangle($image, 32, 32, $width - 33, $height - 33, $black);

imagepng($image, $output, 9);

echo "Generated app/img/social-card.png\n";
