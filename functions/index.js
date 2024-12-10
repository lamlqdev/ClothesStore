// Import the necessary modules
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const { onRequest } = require("firebase-functions/v2/https");

const app = express(); 
app.use(express.json());

// Initialize Firebase Admin SDK
admin.initializeApp();

// Get the Firestore database instance
const db = admin.firestore();

// Define the scheduled function using onSchedule
exports.checkAndCancelOrders = onSchedule("0 * * * *", async (event) => {
  try {
    logger.log("Scheduled function checkAndCancelOrders started.");

    // Get the current time and calculate 3 days ago
    const now = admin.firestore.Timestamp.now();
    const threeDaysAgo = now.toDate(); // Convert to JavaScript Date
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3); // Subtract 3 days

    // Fetch orders that need to be canceled
    const ordersSnapshot = await db
      .collection("Orders")
      .where("orderStatus", "==", "Waiting for payment")
      .where("orderTime", "<=", threeDaysAgo)
      .get();

    if (ordersSnapshot.empty) {
      logger.log("No orders to cancel.");
      return;
    }

    // Batch update to cancel orders
    const batch = db.batch();
    ordersSnapshot.forEach((doc) => {
      batch.update(doc.ref, { orderStatus: "Canceled" });
    });

    // Commit the batch update
    await batch.commit();
    logger.log(`Canceled ${ordersSnapshot.size} overdue orders successfully.`);
  } catch (error) {
    logger.error("Error canceling overdue orders:", error);
  }
});

// Route xử lý webhook PayPal
app.post("/paypalWebhook", async (req, res) => {
  try {
    const event = req.body; // Lấy dữ liệu webhook từ PayPal
    console.log("Received PayPal Webhook:", JSON.stringify(event, null, 2));

    if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
      const orderId = event.resource.id; // ID giao dịch PayPal

      // Cập nhật trạng thái đơn hàng trên Firestore
      await db.collection("Orders").doc(orderId).update({
        orderStatus: "Active",
        updatedTime: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`Order ${orderId} updated to Active`);
      res.status(200).send("Webhook processed successfully");
    } else {
      console.warn("Unhandled PayPal event type:", event.event_type);
      res.status(400).send("Unhandled event type");
    }
  } catch (error) {
    console.error("Error handling PayPal webhook:", error);
    res.status(500).send("Failed to process webhook");
  }
});

// Triển khai webhook như một Cloud Function
exports.paypalWebhook = onRequest(app);
