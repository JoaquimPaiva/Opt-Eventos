import type { StripeElementsOptions } from '@stripe/stripe-js';

interface StripeAppearanceParams {
    clientSecret: string;
}

export function buildStripeElementsOptions({
    clientSecret,
}: StripeAppearanceParams): StripeElementsOptions {
    return {
        clientSecret,
        appearance: {
            theme: 'flat',
            labels: 'floating',
            variables: {
                colorPrimary: '#0b2a4a',
                colorBackground: '#ffffff',
                colorText: '#0f172a',
                colorTextSecondary: '#475569',
                colorDanger: '#be123c',
                colorSuccess: '#047857',
                borderRadius: '14px',
                spacingUnit: '4px',
                fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
            },
            rules: {
                '.Input': {
                    border: '1px solid #dbe3ee',
                    boxShadow: 'none',
                },
                '.Input:focus': {
                    border: '1px solid #0b2a4a',
                    boxShadow: '0 0 0 3px rgba(11, 42, 74, 0.12)',
                },
                '.Tab': {
                    border: '1px solid #dbe3ee',
                    backgroundColor: '#f8fafc',
                },
                '.Tab:hover': {
                    borderColor: '#c2d0e0',
                    color: '#1e293b',
                },
                '.Tab--selected': {
                    borderColor: '#0b2a4a',
                    backgroundColor: '#eaf1f9',
                    color: '#0b2a4a',
                },
                '.Label': {
                    color: '#334155',
                    fontWeight: '500',
                },
                '.Error': {
                    color: '#be123c',
                },
                '.Block': {
                    backgroundColor: '#ffffff',
                },
                '.CodeInput': {
                    border: '1px solid #dbe3ee',
                },
            },
        },
        loader: 'auto',
        fonts: [],
    };
}
