/// <reference lib="webworker" />
export { };
declare const self: ServiceWorkerGlobalScope;

interface NotificationEventWithReply extends NotificationEvent {
    reply?: string;
}

interface NotificationData {
    id?: number;
    replyActionTag?: string;
}

interface HandlerMessage {
    type: 'OnClose' | 'OnClick' | 'OnReply';
    data: NotificationData;
    action?: string;
    reply?: string;
}

self.addEventListener('install', function (event: ExtendableEvent) {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function (event: ExtendableEvent) {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('notificationclose', function (event: NotificationEvent) {
    const notification = event.notification;
    const data: NotificationData = notification.data || {};
    event.waitUntil(
        (async function () {
            await notifyHandlers({
                data: data,
                type: 'OnClose'
            });
        })()
    );
});

self.addEventListener('notificationclick', function (event: NotificationEventWithReply) {
    const notification = event.notification;
    const action = event.action;
    const data: NotificationData = notification.data || {};
    const reply = event.reply; // populated only if this was a text-action reply    
    event.waitUntil(
        (async function () {
            if (action && data.replyActionTag === action) {
                await notifyHandlers({
                    action: action,
                    data: data,
                    type: 'OnReply',
                    reply: reply
                });
                return;
            }

            await notifyHandlers({
                action: action,
                data: data,
                type: 'OnClick'
            });
        })()
    );
});

async function notifyHandlers(message: HandlerMessage): Promise<void> {
    try {
        const allClients = await self.clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        });
        for (const client of allClients) {
            client.postMessage(message);
        }
    } catch (error) {
        console.error('Error on notifications:', error);
    }
}
