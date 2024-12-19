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

    // Batch update to cancel orders and update product quantities
    const batch = db.batch();
    const updates = [];

    for (const doc of ordersSnapshot.docs) {
      const orderData = doc.data();

      // Ensure the order has products to process
      if (orderData.products && Array.isArray(orderData.products)) {
        for (const product of orderData.products) {
          const { productId, size, quantity } = product;

          if (productId && size && quantity) {
            // Push an update for each product size to increase quantity
            updates.push(
              (async () => {
                const productRef = db.collection("Products").doc(productId);
                const productDoc = await productRef.get();

                if (productDoc.exists) {
                  const productData = productDoc.data();
                  const updatedSizelist = productData.sizelist.map((item) => {
                    if (item.size === size) {
                      return { ...item, quantity: item.quantity + quantity };
                    }
                    return item;
                  });

                  // Update the product in Firestore
                  await productRef.update({ sizelist: updatedSizelist });
                } else {
                  logger.warn(`Product with ID ${productId} not found.`);
                }
              })()
            );
          }
        }
      }

      // Mark the order as canceled
      batch.update(doc.ref, { orderStatus: "Canceled" });
    }

    // Wait for all product updates to complete
    await Promise.all(updates);

    // Commit the batch update for orders
    await batch.commit();
    logger.log(`Canceled ${ordersSnapshot.size} overdue orders and updated product quantities successfully.`);
  } catch (error) {
    logger.error("Error canceling overdue orders:", error);
  }
});







