const functions = require('firebase-functions');
const { SessionsClient } = require('@google-cloud/dialogflow-cx');
const admin = require('firebase-admin');

const serviceAccount = require('./fashionstore-3d195-01337bdd50ae.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const projectId = 'fashionstore-3d195';
const location = 'us-central1';
const agentId = '6789c600-da1e-4017-a85c-cab0344c1e79';
const languageCode = 'en';

const client = new SessionsClient({ apiEndpoint: `${location}-dialogflow.googleapis.com` });

exports.detectIntentTextV2 = functions.https.onRequest(async (req, res) => {
  try {
    const query = req.body.query;
    const sessionId = req.body.sessionId || 'default-session-id';  // Sử dụng sessionId từ client hoặc đặt mặc định
    if (!query) {
      res.status(400).send('Query parameter is missing');
      return;
    }

    // Tạo đường dẫn phiên cố định với sessionId của người dùng
    const sessionPath = client.projectLocationAgentSessionPath(
      projectId,
      location,
      agentId,
      sessionId
    );

    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: query,
        },
        languageCode,
      },
    };

    const [response] = await client.detectIntent(request);

    // Xử lý các phản hồi văn bản từ bot
    const messages = response.queryResult.responseMessages
      .map((msg) => (msg.text ? msg.text.text : ''))
      .filter((text) => text);

    // Lấy intent và trang hiện tại
    const intent = response.queryResult.match.intent
      ? response.queryResult.match.intent.displayName
      : null;
    const currentPage = response.queryResult.currentPage.displayName;

    // Kiểm tra và lấy Custom Payload nếu có
    let customPayload = null;
    for (const msg of response.queryResult.responseMessages) {
      if (msg.payload) {
        customPayload = msg.payload;
        break;
      }
    }

    // Trích xuất richContent từ customPayload
    let formattedRichContent = [];
    if (
      customPayload &&
      customPayload.fields &&
      customPayload.fields.richContent &&
      customPayload.fields.richContent.listValue
    ) {
      const richContentList = customPayload.fields.richContent.listValue.values;

      formattedRichContent = richContentList.map(item => {
        const optionsList = item.listValue.values[0].structValue.fields.options.listValue.values.map(option => {
          return {
            text: option.structValue.fields.text.stringValue
          };
        });

        return {
          type: item.listValue.values[0].structValue.fields.type.stringValue,
          options: optionsList
        };
      });
    }

    // Trả về phản hồi đã định dạng với sessionId
    res.json({
      sessionId, // Trả lại sessionId cho client
      messages,
      matchedIntent: intent,
      currentPage,
      customPayload: {
        richContent: formattedRichContent
      }
    });
  } catch (error) {
    console.error('Error detecting intent:', error);
    res.status(500).send('Error detecting intent');
  }
});


