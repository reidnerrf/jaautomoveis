import { Request, Response } from "express";
import webpush from "web-push";
import PushSubscription from "../models/PushSubscription";

// Configurar VAPID keys
const vapidKeys = webpush.generateVAPIDKeys();

webpush.setVapidDetails(
  "mailto:contato@jaautomoveis.com.br",
  process.env.VAPID_PUBLIC_KEY || vapidKeys.publicKey,
  process.env.VAPID_PRIVATE_KEY || vapidKeys.privateKey,
);

// @desc    Subscribe to push notifications
// @route   POST /api/push/subscribe
// @access  Public
export const subscribeToPush = async (req: Request, res: Response) => {
  try {
    const { endpoint, keys } = req.body;

    if (!endpoint || !keys) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Verificar se já existe subscription
    let subscription = await PushSubscription.findOne({ endpoint });

    if (subscription) {
      // Atualizar subscription existente
      subscription.keys = keys;
      subscription.lastUsed = new Date();
      subscription.userAgent = req.get("User-Agent");
      await subscription.save();
    } else {
      // Criar nova subscription
      subscription = new PushSubscription({
        endpoint,
        keys,
        userAgent: req.get("User-Agent"),
      });
      await subscription.save();
    }

    res.status(200).json({
      message: "Successfully subscribed to push notifications",
      subscriptionId: subscription._id,
    });
  } catch (error) {
    console.error("Error subscribing to push notifications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Unsubscribe from push notifications
// @route   POST /api/push/unsubscribe
// @access  Public
export const unsubscribeFromPush = async (req: Request, res: Response) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({ message: "Missing endpoint" });
    }

    const subscription = await PushSubscription.findOne({ endpoint });

    if (subscription) {
      subscription.isActive = false;
      await subscription.save();
    }

    res
      .status(200)
      .json({ message: "Successfully unsubscribed from push notifications" });
  } catch (error) {
    console.error("Error unsubscribing from push notifications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Send push notification
// @route   POST /api/push/send
// @access  Private/Admin
export const sendPushNotification = async (req: Request, res: Response) => {
  try {
    const { title, body, url, icon, badge, tag, data, userId } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: "Title and body are required" });
    }

    // Construir payload da notificação
    const payload = JSON.stringify({
      title,
      body,
      icon: icon || "/assets/logo.png",
      badge: badge || "/assets/favicon-32x32.png",
      tag,
      data: {
        url: url || "/",
        ...data,
      },
      actions: [
        {
          action: "explore",
          title: "Ver mais",
          icon: "/assets/favicon-32x32.png",
        },
        {
          action: "close",
          title: "Fechar",
          icon: "/assets/favicon-32x32.png",
        },
      ],
    });

    // Buscar subscriptions ativas
    const query: any = { isActive: true };
    if (userId) {
      query.userId = userId;
    }

    const subscriptions = await PushSubscription.find(query);

    if (subscriptions.length === 0) {
      return res.status(404).json({ message: "No active subscriptions found" });
    }

    // Enviar notificações
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: subscription.keys,
            },
            payload,
          );

          // Atualizar lastUsed
          subscription.lastUsed = new Date();
          await subscription.save();

          return { success: true, subscriptionId: subscription._id };
        } catch (error: any) {
          // Se a subscription é inválida, marcar como inativa
          if (error.statusCode === 410) {
            subscription.isActive = false;
            await subscription.save();
          }
          return {
            success: false,
            subscriptionId: subscription._id,
            error: error.message,
          };
        }
      }),
    );

    const successful = results.filter(
      (result) => result.status === "fulfilled" && result.value.success,
    ).length;

    const failed = results.length - successful;

    res.status(200).json({
      message: `Push notification sent to ${successful} subscribers`,
      total: subscriptions.length,
      successful,
      failed,
    });
  } catch (error) {
    console.error("Error sending push notification:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Get push notification statistics
// @route   GET /api/push/stats
// @access  Private/Admin
export const getPushStats = async (req: Request, res: Response) => {
  try {
    const totalSubscriptions = await PushSubscription.countDocuments();
    const activeSubscriptions = await PushSubscription.countDocuments({
      isActive: true,
    });
    const todaySubscriptions = await PushSubscription.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    const recentSubscriptions = await PushSubscription.find({ isActive: true })
      .sort({ lastUsed: -1 })
      .limit(10)
      .select("endpoint createdAt lastUsed userAgent");

    res.status(200).json({
      totalSubscriptions,
      activeSubscriptions,
      todaySubscriptions,
      recentSubscriptions,
    });
  } catch (error) {
    console.error("Error getting push stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Get VAPID public key
// @route   GET /api/push/vapid-public-key
// @access  Public
export const getVapidPublicKey = async (req: Request, res: Response) => {
  res.status(200).json({
    publicKey: process.env.VAPID_PUBLIC_KEY || vapidKeys.publicKey,
  });
};

export default {
  subscribeToPush,
  unsubscribeFromPush,
  sendPushNotification,
  getPushStats,
  getVapidPublicKey,
};
