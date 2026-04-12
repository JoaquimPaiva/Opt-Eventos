<?php

return [
    'version' => env('LEGAL_TEXT_VERSION', '2026-04-11'),
    'operator' => [
        'brand_name' => env('LEGAL_BRAND_NAME', 'OptEventos'),
        'legal_name' => env('LEGAL_LEGAL_NAME', 'OptViagens, Lda.'),
        'nif' => env('LEGAL_NIF', '509999999'),
        'address' => env('LEGAL_ADDRESS', 'Lisboa, Portugal'),
        'email' => env('LEGAL_EMAIL', 'support@optviagens.pt'),
        'phone' => env('LEGAL_PHONE', '+351 210 000 000'),
        'commercial_registry' => env('LEGAL_COMMERCIAL_REGISTRY', 'Conservatória do Registo Comercial de Lisboa'),
        'share_capital' => env('LEGAL_SHARE_CAPITAL', '10.000 EUR'),
    ],
    'privacy' => [
        'contact_email' => env('LEGAL_PRIVACY_CONTACT_EMAIL', 'privacy@optviagens.pt'),
        'retention' => [
            'conta' => 'Enquanto a conta estiver ativa e até 24 meses após inatividade.',
            'reservas' => 'Até 10 anos para cumprimento de obrigações contabilísticas e fiscais.',
            'faturacao' => 'Até 10 anos, nos termos legais e fiscais aplicáveis.',
            'logs' => 'Entre 6 e 12 meses, salvo obrigação legal de retenção superior.',
            'consentimentos' => 'Até 5 anos após a última interação relevante.',
        ],
        'processors' => [
            'Stripe (processamento de pagamentos online).',
            'Prestador de alojamento cloud e infraestrutura aplicacional.',
            'Prestadores de email transacional/notificações operacionais.',
        ],
        'international_transfers' => 'Quando necessário, as transferências internacionais de dados assentam em mecanismos legalmente válidos (ex.: Cláusulas Contratuais-Tipo).',
    ],
    'ral' => [
        'entity_name' => env('LEGAL_RAL_ENTITY_NAME', 'CNIACC - Centro Nacional de Informação e Arbitragem de Conflitos de Consumo'),
        'website' => env('LEGAL_RAL_WEBSITE', 'https://www.cniacc.pt/pt/'),
        'email' => env('LEGAL_RAL_EMAIL', 'geral@cniacc.pt'),
        'phone' => env('LEGAL_RAL_PHONE', '+351 213 847 484'),
    ],
    'complaints_book_url' => env('LEGAL_COMPLAINTS_BOOK_URL', 'https://www.livroreclamacoes.pt/'),
    'odr_discontinued_on' => '2025-07-20',
];
