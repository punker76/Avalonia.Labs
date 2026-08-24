export function isServiceSupported() {
    return 'serviceWorker' in navigator;
}

export async function registerServiceWorker() {
    await navigator.serviceWorker.register("notifications-service-worker.js")
        .then(
            (registration) => {
                console.log("Install succeeded, scoped to '/'", registration);
            },
            (error) => {
                console.error(`Service worker registration failed: ${error}`);
            },
        );
}

export async function requestPermission() {
    return await Notification.requestPermission();
}

export function isSupported() {
    return 'Notification' in window;
}

export async function close(id) {
    const registration = await navigator.serviceWorker.ready;
    const notifications = await registration.getNotifications();
    notifications.forEach(n => {
        if (n.data && Number(n.data.id) === Number(id)) {
            console.log("Closed");
            n.close();
        }
    });
}

export async function closeAllNotifications() {
    const registration = await navigator.serviceWorker.ready;
    const notifications = await registration.getNotifications();
    notifications.forEach(n => n.close());
    return notifications.length;
}

export async function create(title, json) {
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
        return; // or throw a custom, catchable error
    }
    let options = JSON.parse(json);
    const notificationsOptions =
    {
        actions: options.Actions.map(a => ({
            action: a.Action,
            title: a.Title,
            type: a.Type,
            icon: a.Icon
        })),
        body: options.Body || '',
        data:
        {
            id: options.Data.Id,
            replyActionTag: options.Data.ReplyActionTag || '',
        },
        tag: options.Tag || '',
        icon: options.Icon || '',
        vibrate: options.Vibrations
    };
    const registration = await navigator.serviceWorker.ready;
    try {
        await registration.showNotification(title, notificationsOptions);
    } catch (e) {
        console.error('showNotification failed:', e);
    }
}

export async function registrations(onclose, onclick, onreply) {
    navigator.serviceWorker.addEventListener('message', function (event) {
        if (event.data && event.data.type === 'HandleNotificationClose') {
            onclose(JSON.stringify(event.data));
        }
        if (event.data && event.data.type === 'HandleNotificationClick') {
            onclick(JSON.stringify(event.data));
        }
        if (event.data && event.data.type === 'HandleNotificationReply') {
            onreply(JSON.stringify(event.data), event.data.reply);
        }
    });
}
