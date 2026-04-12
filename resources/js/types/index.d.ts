export interface User {
    id: number;
    name: string;
    email: string;
    nationality?: string | null;
    nif?: string | null;
    role?: 'ADMIN' | 'CLIENT' | 'HOTEL';
    hotel_id?: number | null;
    email_verified_at?: string;
}

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    url: string;
    read_at?: string | null;
    created_at?: string | null;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    flash?: {
        success?: string;
        error?: string;
    };
    notifications?: {
        unread_count: number;
        unread_items: AppNotification[];
        read_items: AppNotification[];
    };
    web_push?: {
        enabled: boolean;
        public_key?: string | null;
    };
    legal?: {
        version?: string;
        operator?: {
            brand_name?: string;
            legal_name?: string;
            nif?: string;
            address?: string;
            email?: string;
            phone?: string;
            commercial_registry?: string;
            share_capital?: string;
        };
        privacy?: {
            contact_email?: string;
            retention?: Record<string, string>;
            processors?: string[];
            international_transfers?: string;
        };
        ral?: {
            entity_name?: string;
            website?: string;
            email?: string;
            phone?: string;
        };
        complaints_book_url?: string;
        odr_discontinued_on?: string;
    };
};
