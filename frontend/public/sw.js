self.addEventListener("push", function (event) {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || "DealDrop Notification";
    const options = {
      body: data.body || "",
      icon: "/icon-192x192.png",
      badge: "/badge-72x72.png",
      vibrate: [100, 50, 100],
      data: data.data || { url: "/deals" },
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error("Error parsing push event data", err);
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/deals";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (windowClients) {
        // Find if DealDrop is already open
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url.includes(new URL(urlToOpen, self.location.origin).pathname) && "focus" in client) {
            return client.focus();
          }
        }
        // If not open, open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
