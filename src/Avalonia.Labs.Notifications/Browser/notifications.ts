interface NotificationAction {
    Action: string;
    Title: string;
    Type: string;
    Icon?: string;
}

interface NotificationData {
    Id: number;
    ReplyActionTag?: string;
}

interface NotificationOptionsJson {
    Actions: NotificationAction[];
    Body?: string;
    Data: NotificationData;
    Tag?: string;
    Icon?: string;
    Vibrations?: number[];
}

type OnCloseCallback = (data: string) => void;
type OnClickCallback = (data: string) => void;
type OnReplyCallback = (data: string, reply: string) => void;

export function isServiceWorkerSupported(): boolean {
    if('serviceWorker' in navigator) {
        return true;
    }
    console.warn("Service workers are not supported in this browser.");
    return false;
}

export async function registerServiceWorker(): Promise<void> {
    await navigator.serviceWorker.register("notifications-service-worker.js", { type: 'module' });
}

export function isSupported(): boolean {
    return 'Notification' in window;
}

export async function closeNotification(id: string): Promise<void> {
    const registration = await navigator.serviceWorker.ready;
    const notifications = await registration.getNotifications();
    const idNum = Number(id);
    notifications.forEach(n => {
        if (n.data && n.data.id === idNum) {
            n.close();
        }
    });
}

export async function closeAllNotifications(): Promise<void> {
    const registration = await navigator.serviceWorker.ready;
    const notifications = await registration.getNotifications();
    notifications.forEach(n => n.close());
}

export async function showNotification(title: string, json: string): Promise<void> {
    if (!isSupported()) {
        console.warn("This browser does not support notifications.");
        return;
    }

    let permission = Notification.permission;
    if (permission === "default") {
        permission = await Notification.requestPermission();
    }
    if (permission !== "granted") {
        console.warn("Notification permission not granted.");
        return;
    }

    const options: NotificationOptionsJson = JSON.parse(json);

    const notificationsOptions: NotificationOptions & {
        actions: NotificationAction[];
        data: { id: number; replyActionTag: string };
        vibrate?: number[];
    } = {
        actions: options.Actions.map(a => ({
            action: a.Action,
            title: a.Title,
            type: a.Type,
            icon: a.Icon
        })) as any,
        body: options.Body || '',
        data: {
            id: options.Data.Id,
            replyActionTag: options.Data.ReplyActionTag || '',
        },
        tag: options.Tag || '',
        icon: options.Icon || '',
        vibrate: options.Vibrations
    };

    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, notificationsOptions);
}

export async function registrations(
    onclose: OnCloseCallback,
    onclick: OnClickCallback,
    onreply: OnReplyCallback
): Promise<void> {
    navigator.serviceWorker.addEventListener('message', function (event: MessageEvent) {
        if (event.data && event.data.type === 'OnClose') {
            onclose(JSON.stringify(event.data));
        }
        if (event.data && event.data.type === 'OnClick') {
            onclick(JSON.stringify(event.data));
        }
        if (event.data && event.data.type === 'OnReply') {
            onreply(JSON.stringify(event.data), event.data.reply);
        }
    });
}
