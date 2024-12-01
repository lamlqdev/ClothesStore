const functions = require('firebase-functions');
const admin = require('firebase-admin');
const CryptoJS = require('crypto-js');

admin.initializeApp();

const key2 = "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf"; // Thay bằng key2 thật của bạn

exports.zaloPayCallback = functions.https.onRequest(async (req, res) => {
  let result = {};

  try {
    // Lấy dữ liệu từ request
    let dataStr = req.body.data;
    let reqMac = req.body.mac;

    if (!dataStr || !reqMac) {
      throw new Error("Dữ liệu không đầy đủ hoặc thiếu 'mac'");
    }

    // Tạo mã HMAC từ key2 và dữ liệu nhận được
    let mac = CryptoJS.HmacSHA256(dataStr, key2).toString();
    console.log("Generated MAC:", mac);

    // Kiểm tra tính hợp lệ của callback
    if (reqMac !== mac) {
      // Callback không hợp lệ
      result.return_code = -1;
      result.return_message = "Xác thực thất bại: MAC không khớp";
    } else {
      // Xử lý khi thanh toán thành công
      let dataJson;
      try {
        dataJson = JSON.parse(dataStr);
      } catch (parseError) {
        throw new Error("Lỗi phân tích dữ liệu JSON: " + parseError.message);
      }

      console.log("Thanh toán thành công cho app_trans_id:", dataJson["app_trans_id"]);

      // Cập nhật trạng thái đơn hàng trong Firestore
      const orderId = dataJson["app_trans_id"];
      const ordersRef = admin.firestore().collection('Orders').doc(orderId);

      try {
        await ordersRef.update({ status: 'Active' });
        result.return_code = 1;
        result.return_message = "Cập nhật trạng thái đơn hàng thành công";
      } catch (dbError) {
        console.error("Lỗi khi cập nhật đơn hàng trong Firestore:", dbError);
        result.return_code = 0;
        result.return_message = "Lỗi khi cập nhật đơn hàng: " + dbError.message;
      }
    }
  } catch (ex) {
    console.error("Exception:", ex.message);
    // Trả lỗi cụ thể cho ZaloPay server
    result.return_code = 0; // ZaloPay server sẽ callback lại nếu trả mã 0
    result.return_message = "Lỗi hệ thống: " + ex.message;
  }

  // Trả kết quả về cho ZaloPay server
  res.json(result);
});





