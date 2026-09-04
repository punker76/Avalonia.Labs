var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
self.addEventListener('install', function (event) {
    event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', function (event) {
    event.waitUntil(self.clients.claim());
});
self.addEventListener('notificationclose', function (event) {
    const notification = event.notification;
    const data = notification.data || {};
    event.waitUntil((function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield notifyHandlers({
                data: data,
                type: 'OnClose'
            });
        });
    })());
});
self.addEventListener('notificationclick', function (event) {
    const notification = event.notification;
    const action = event.action;
    const data = notification.data || {};
    const reply = event.reply; // populated only if this was a text-action reply    
    event.waitUntil((function () {
        return __awaiter(this, void 0, void 0, function* () {
            if (action && data.replyActionTag === action) {
                yield notifyHandlers({
                    action: action,
                    data: data,
                    type: 'OnReply',
                    reply: reply
                });
                return;
            }
            yield notifyHandlers({
                action: action,
                data: data,
                type: 'OnClick'
            });
        });
    })());
});
function notifyHandlers(message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const allClients = yield self.clients.matchAll({
                type: 'window',
                includeUncontrolled: true
            });
            for (const client of allClients) {
                client.postMessage(message);
            }
        }
        catch (error) {
            console.error('Error on notifications:', error);
        }
    });
}
export {};
//# sourceMappingURL=notifications-service-worker.js.map