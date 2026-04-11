<?php

// // Verifica se NÃO está em HTTPS
// $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') 
//     || $_SERVER['SERVER_PORT'] == 443;

// // URL atual
// $requestUri = $_SERVER['REQUEST_URI'];

// // Se não for HTTPS OU não estiver em /public
// if (!$isHttps || strpos($requestUri, '/public') !== 0) {
    
//     // Remove /public duplicado se existir
//     $path = preg_replace('#^/public#', '', $requestUri);

//     // Redireciona para HTTPS + /public
//     $redirectUrl = 'https://opt.joaquimpaiva.site/public' . $path;

//     header("Location: " . $redirectUrl, true, 301);
//     exit;
// }