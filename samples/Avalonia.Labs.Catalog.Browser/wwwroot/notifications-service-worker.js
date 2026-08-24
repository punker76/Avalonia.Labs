self.addEventListener('install', function (event) {
    console.log('Service Worker installed');
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function (event) {
    console.log('Service Worker activated');
    event.waitUntil(self.clients.claim());
});

self.addEventListener('notificationclose', function (event) {
    console.log("close");
    const notification = event.notification;
    const data = notification.data || {};
    event.waitUntil(
        (async function () {
            await notifyHandlers({
                data: data,
                type: 'HandleNotificationClose'
            });
        })()
    );
});

self.addEventListener('notificationclick', function (event) {
    const notification = event.notification;
    const action = event.action;
    const data = notification.data || {};
    const reply = event.reply; // populated only if this was a text-action reply
    //notification.close();

    event.waitUntil(
        (async function () {
            if (action && data.replyActionTag === action) {
                await notifyHandlers({
                    action: action,
                    data: data,
                    type: 'HandleNotificationReply',
                    reply: reply
                });
                return;
            }

            await notifyHandlers({
                action: action,
                data: data,
                type: 'HandleNotificationClick'
            });
        })()
    );
});

// Helper to send data to Blazor
async function notifyHandlers(message) {
    try {
        const allClients = await clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        });

        for (const client of allClients) {
            try {
                await client.postMessage(message);
            } catch (e) {
                console.error(e);
            }
        }
    } catch (error) {
        console.error('Error sending to Blazor:', error);
    }
}
