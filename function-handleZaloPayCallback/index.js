const functions = require('firebase-functions');
const admin = require('firebase-admin');
const CryptoJS = require('crypto-js');

// Khởi tạo Firebase Admin SDK
admin.initializeApp();

const config = {
  key2: "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf"
};

exports.handleZaloPayCallback = functions.https.onRequest(async (req, res) => {
  let result = {};

  try {
    // Lấy dữ liệu từ request body
    const dataStr = req.body.data;
    const reqMac = req.body.mac;

    // Kiểm tra dữ liệu hợp lệ
    if (!dataStr || !reqMac) {
      result = {
        return_code: -1,
        return_message: "Invalid request data or MAC"
      };
      return res.status(400).json(result);
    }

    // Tạo MAC để xác minh tính toàn vẹn dữ liệu
    const mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString(CryptoJS.enc.Hex);
    console.log("Generated MAC =", mac);

    if (reqMac !== mac) {
      result = {
        return_code: -1,
        return_message: "MAC mismatch"
      };
      return res.status(401).json(result);
    }

    // Chuyển dataStr sang JSON
    const dataJson = JSON.parse(dataStr);
    const appTransId = dataJson["app_trans_id"];

    console.log("Searching for order with appTransId =", appTransId);

    // Truy vấn Firestore để tìm đơn hàng có appTransId
    const ordersRef = admin.firestore().collection('Orders');
    const snapshot = await ordersRef.where('appTransId', '==', appTransId).limit(1).get();

    if (snapshot.empty) {
      console.log("No matching order found for appTransId:", appTransId);
      result = {
        return_code: -1,
        return_message: "Order not found"
      };
      return res.status(404).json(result);
    }

    // Cập nhật trạng thái đơn hàng
    const orderDoc = snapshot.docs[0];
    await orderDoc.ref.update({
      orderStatus: 'Active',
      updateTime: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log("Order updated successfully for appTransId =", appTransId);

    result = {
      return_code: 1,
      return_message: "Success"
    };
  } catch (ex) {
    console.error("Error handling ZaloPay callback:", ex);
    result = {
      return_code: 0,
      return_message: "Error processing request: " + ex.message
    };
    return res.status(500).json(result);
  }

  res.json(result);
});








