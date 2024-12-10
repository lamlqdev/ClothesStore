// Import the necessary modules
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");

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






