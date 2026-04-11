self.addEventListener('push', (event) => {
    let data = {};

    try {
        data = event.data ? event.data.json() : {};
    } catch {
        data = {};
    }

    const title = data.title || 'OptEventos';
    const options = {
        body: data.message || 'Tens uma nova notificação.',
        icon: data.icon || '/favicon.ico',
        badge: data.badge || '/favicon.ico',
        data: {
            url: data.url || '/',
        },
        tag: data.tag || `opteventos-${Date.now()}`,
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (const client of windowClients) {
                if ('focus' in client) {
                    client.navigate(targetUrl);
                    return client.focus();
                }
            }

            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }

            return undefined;
        }),
    );
});

