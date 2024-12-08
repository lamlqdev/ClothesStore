// Import the necessary modules
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
admin.initializeApp();

// Get the Firestore database instance
const db = admin.firestore();

// Define the scheduled function using onSchedule
//exports.updateMembership = onSchedule("*/1 * * * *", async (event) => {
exports.updateMembership = onSchedule("0 0 1 * *", async (event) => {
  try {
    logger.log("Scheduled function updateMembership started.");

    // Fetch users and memberships data in parallel
    const [usersSnapshot, membershipsSnapshot] = await Promise.all([
      db.collection("users").get(),
      db.collection("Membership").get(),
    ]);

    if (membershipsSnapshot.empty || usersSnapshot.empty) {
      logger.error("No memberships or users found.");
      return;
    }

    // Process memberships data
    const memberships = membershipsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Calculate the date range for the past 6 months
    const currentDate = new Date();
    const startDate = new Date(currentDate);
    startDate.setMonth(currentDate.getMonth() - 6);

    // Fetch all orders within the last 6 months
    const ordersSnapshot = await db
      .collection("Orders")
      .where("orderTime", ">=", startDate)
      .where("orderTime", "<", currentDate)
      .get();

    // Create a map to group orders by userId
    const ordersByUser = ordersSnapshot.docs.reduce((map, orderDoc) => {
      const order = orderDoc.data();
      if (!map[order.userId]) {
        map[order.userId] = [];
      }
      map[order.userId].push(order);
      return map;
    }, {});

    // Process each user and update their membership if needed
    await Promise.all(
      usersSnapshot.docs.map(async (userDoc) => {
        const userId = userDoc.id;
        const userOrders = ordersByUser[userId] || []; // Get orders for the user

        // Calculate total spending for completed orders
        const totalSpent = userOrders
          .filter((order) => order.orderStatus === "Completed")
          .reduce((sum, order) => sum + (order.total || 0), 0);

        if (totalSpent === 0) {
          logger.log(`User ${userId} has no completed orders in the past 6 months.`);
          return;
        }

        // Find the best membership option
        let bestMembership = null;
        let minDifference = Infinity;

        memberships.forEach((membership) => {
          const minimumSpend = membership.minimumSpend || 0;
          const diff = totalSpent - minimumSpend;
          if (diff >= 0 && diff < minDifference) {
            minDifference = diff;
            bestMembership = membership.id;
          }
        });

        if (!bestMembership) {
          logger.log(`User ${userId} does not qualify for any membership.`);
          return;
        }

        // Update membership level if necessary
        if (userDoc.data().membershipLevel !== bestMembership) {
          await db.collection("users").doc(userId).update({ membershipLevel: bestMembership });
          logger.log(`Updated membership for user ${userId} to ${bestMembership}`);
        }
      })
    );

    logger.log("Membership update completed successfully.");
  } catch (error) {
    logger.error("Error updating memberships:", error);
  }
});






