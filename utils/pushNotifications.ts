interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class PushNotificationManager {
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;

  async initialize() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("Push notifications not supported");
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.ready;
      return true;
    } catch (error) {
      console.error("Failed to initialize push notifications:", error);
      return false;
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!this.registration) {
      const initialized = await this.initialize();
      if (!initialized) return false;
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  async subscribe(): Promise<PushSubscription | null> {
    if (!this.registration) {
      const initialized = await this.initialize();
      if (!initialized) return null;
    }

    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      console.log("Notification permission denied");
      return null;
    }

    try {
      this.subscription = await this.registration!.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.VAPID_PUBLIC_KEY || "",
        ),
      });

      // Enviar subscription para o servidor
      await this.sendSubscriptionToServer(this.subscription);

      return this.subscription;
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error);
      return null;
    }
  }

  async unsubscribe(): Promise<boolean> {
    if (!this.subscription) return false;

    try {
      await this.subscription.unsubscribe();
      await this.removeSubscriptionFromServer(this.subscription);
      this.subscription = null;
      return true;
    } catch (error) {
      console.error("Failed to unsubscribe from push notifications:", error);
      return false;
    }
  }

  async isSubscribed(): Promise<boolean> {
    if (!this.registration) {
      const initialized = await this.initialize();
      if (!initialized) return false;
    }

    const subscription = await this.registration!.pushManager.getSubscription();
    return subscription !== null;
  }

  private async sendSubscriptionToServer(subscription: PushSubscription) {
    try {
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: this.arrayBufferToBase64(subscription.getKey("p256dh")!),
            auth: this.arrayBufferToBase64(subscription.getKey("auth")!),
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send subscription to server");
      }
    } catch (error) {
      console.error("Error sending subscription to server:", error);
    }
  }

  private async removeSubscriptionFromServer(subscription: PushSubscription) {
    try {
      await fetch("/api/push/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      });
    } catch (error) {
      console.error("Error removing subscription from server:", error);
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  // Método para testar notificações
  async testNotification() {
    if (!this.registration) return;

    await this.registration.showNotification("Teste JA Automóveis", {
      body: "Esta é uma notificação de teste!",
      icon: "/assets/logo.png",
      badge: "/assets/favicon-32x32.png",
      vibrate: [100, 50, 100],
      data: {
        url: "/",
      },
      actions: [
        {
          action: "explore",
          title: "Ver mais",
          icon: "/assets/favicon-32x32.png",
        },
      ],
    });
  }
}

export const pushNotificationManager = new PushNotificationManager();
export default pushNotificationManager;
