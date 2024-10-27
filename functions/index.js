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
    if (!query) {
      res.status(400).send('Query parameter is missing');
      return;
    }

    const sessionId = Math.random().toString(36).substring(7);
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

    // Lấy các tin nhắn văn bản phản hồi từ bot
    const messages = response.queryResult.responseMessages
      .map((msg) => (msg.text ? msg.text.text : ''))
      .filter((text) => text);

    // Lấy intent và current page
    const intent = response.queryResult.match.intent
      ? response.queryResult.match.intent.displayName
      : null;
    const currentPage = response.queryResult.currentPage.displayName;

    // Khởi tạo customPayload
    let customPayload = null;

    // Kiểm tra và lấy Custom Payload từ agent responses nếu có
    for (const msg of response.queryResult.responseMessages) {
      if (msg.payload) {
        customPayload = msg.payload;
        break; // Lấy payload đầu tiên và dừng lại
      }
    }

    // Trích xuất richContent từ customPayload
    let formattedRichContent = [];
    if (customPayload && customPayload.fields && customPayload.fields.richContent && customPayload.fields.richContent.listValue) {
      const richContentList = customPayload.fields.richContent.listValue.values;

      formattedRichContent = richContentList.map(item => {
        const optionsList = item.listValue.values[0].structValue.fields.options.listValue.values.map(option => {
          return {
            text: option.structValue.fields.text.stringValue // Lấy text từ từng option
          };
        });

        return {
          type: item.listValue.values[0].structValue.fields.type.stringValue,
          options: optionsList
        };
      });
    }

    // Trả về dữ liệu đã định dạng
    res.json({
      messages,
      matchedIntent: intent,
      currentPage,
      customPayload: {
        richContent: formattedRichContent // Trả về richContent đã định dạng lại
      }
    });
  } catch (error) {
    console.error('Error detecting intent:', error);
    res.status(500).send('Error detecting intent');
  }
});

