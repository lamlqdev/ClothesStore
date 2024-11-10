import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Image, TouchableOpacity } from 'react-native';
import avatarImage from '../../assets/icons/avatar.png';
import sendIcon from '../../assets/icons/send-100.png';
import Header from '../components/Header';
import { useNavigation } from '@react-navigation/native';


const MessageScreen = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentPage, setCurrentPage] = useState(''); // lưu page hiện tại
  const [sessionId, setSessionId] = useState(''); // lưu sessionId

  useEffect(() => {
    // Tạo sessionId mới khi lần đầu tiên truy cập
    const newSessionId = Math.random().toString(36).substring(7);
    setSessionId(newSessionId);
  }, []);

  const sendMessage = async (message = query) => {
    if (!message.trim()) return;

    try {
      const response = await fetch('https://us-central1-fashionstore-3d195.cloudfunctions.net/detectIntentTextV2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: message, currentPage, sessionId }), // gửi currentPage và sessionId
      });
      const data = await response.json();

      // Cập nhật currentPage với giá trị mới từ phản hồi của bot
      setCurrentPage(data.currentPage || '');

      // Tạo một mảng các tin nhắn từ bot
      const botMessages = data.messages.map((text) => ({
        sender: 'bot',
        text,
        options: data.customPayload?.richContent[0]?.options || [],
      }));

      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'user', text: message },
        ...botMessages,
      ]);
      setQuery('');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleOptionPress = (optionText) => {
    setQuery(optionText);
    sendMessage(optionText);
  };

  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.botMessageContainer]}>
        {!isUser && <Image source={avatarImage} style={styles.botAvatar} />}
        <View style={[styles.messageBubble, isUser ? styles.userMessage : styles.botMessage]}>
          <Text style={{ color: isUser ? 'white' : 'black' }}>{item.text}</Text>
        </View>
        {!isUser && item.options && item.options.length > 0 && (
          <View style={styles.optionsContainer}>
            {item.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.optionButton}
                onPress={() => handleOptionPress(option.text)}
              >
                <Text style={styles.optionText}>{option.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <Header title="ChatBox" onBackPress={() => navigation.goBack()} />

      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderMessage}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
      <View style={styles.inputContainer}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Ask something..."
          style={styles.input}
        />
        <TouchableOpacity onPress={() => sendMessage()} style={styles.sendButton}>
          <Image source={sendIcon} style={styles.sendIcon} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  messageContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginVertical: 5,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  botMessageContainer: {
    alignItems: 'flex-start',
  },
  botAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 20,
    maxWidth: '75%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#8a2be2',
    borderBottomRightRadius: 0,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0e0e0',
    borderBottomLeftRadius: 0,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  optionButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
    marginTop: 5,
  },
  optionText: {
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 50,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'white',
  },
  sendButton: {
    padding: 8,
  },
  sendIcon: {
    width: 40,
    height: 40,
  },
});

export default MessageScreen;
