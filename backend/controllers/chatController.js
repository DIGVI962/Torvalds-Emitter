require('dotenv').config();
// import axios
const axios = require('axios');

const chatController = {
    generateResponse: async (msg, threadId) => {
        try {
            if (!msg) {
                return {
                    error: 'Missing required fields',
                    details: 'Message is required'
                };
            }
            console.log('Message in generateResponse' + msg);
            const completionRequest = {
                query: msg,
                thread_id: threadId
            };
            const completionResponse = await axios.post('https://dfbf-38-188-110-250.ngrok-free.app/chat/v2', data = completionRequest);
            const completionData = completionResponse.data;
            // Handle JSON chunks and combine messages
            console.log(completionData);
            return {
                success: true,
                message: combinedMessage,
                threadId: threadId,
                error: '',
                details: ''
            };
        } catch (error) {
            console.error('Failed to generate response:', error);
            return {
                success: false,
                error: 'Failed to generate response',
                details: error.message,
                message: '',
                threadId: threadId,
            };
        }
    },

    translateText: async (msg, threadId) => {
        try {
            const source = 'auto';
            const target = 'english';
            if (!msg) {
                return {
                    error: 'Missing required fields',
                    details: 'Message is required'
                };
            }
            const reqBody = {
                query: msg,
                source: source,
                target: target
            };
            // console.log('Translation Request in translateText' + msg);
            const response = await axios.post('https://dfbf-38-188-110-250.ngrok-free.app/translate', data = reqBody);
            const translateData = response.data;
            console.log('Translated Data in translateText' + translateData);
            const completionRequest = {
                query: translateData,
                thread_id: threadId
            }
            // console.log(completionRequest);
            return completionRequest;
        } catch (error) {
            console.error('Failed to translate text:', error.message);
            return {
                error: 'Failed to translate text'
            };
        }
    },

    handleTranslation: async (req, res) => {
        try {
            const { query, threadId } = req.body;
            // console.log('Query handleTranslation' + query);
            if (!query) {
                return res.status(400).json({
                    error: 'Missing required fields',
                    details: 'Query is required'
                });
            }
            const translationResponse = await chatController.translateText(query, threadId);
            // console.log('translation Response in handleTranslation' + translationResponse);
            // const { translatedQuery } = translationResponse;
            const translatedFinalResponse = await chatController.generateResponse(translationResponse, req.body.threadId);
            res.json(translatedFinalResponse);
        } catch (error) {
            console.error('Failed to translate text:', error);
            res.status(500).json({
                error: 'Failed to translate text'
            });
        }
    }
}

module.exports = chatController;