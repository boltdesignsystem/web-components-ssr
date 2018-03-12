<?php

require('../packages/php-ssr/vendor/autoload.php');

use TwigComponentsSSR\Renderer;

$templates = json_decode(file_get_contents('./build/bolt.templates.json'), TRUE);
$html = file_get_contents('./index.html');
$renderer = new Renderer($templates);

echo $renderer->render($html);
