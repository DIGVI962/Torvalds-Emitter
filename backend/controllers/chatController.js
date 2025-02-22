require('dotenv').config();
// import axios
const axios = require('axios');

const chatController = {
    generateResponse: async (req, res) => {
        const { query, thread_Id } = req.body;
        try {
            if (!query) {
                return {
                    error: 'Missing required fields',
                    details: 'Message is required'
                };
            }
            console.log('Message in generateResponse' + query);
            const completionRequest = {
                query: query,
                thread_Id: thread_Id
            };
            const completionResponse = await axios.post('https://dfbf-38-188-110-250.ngrok-free.app/chat/v2', data = {query: query, thread_id: thread_Id});
            const completionData = completionResponse.message;
            // Handle JSON chunks and combine messages
            console.log(completionResponse.message);
            return res = {
                success: true,
                message: completionResponse.message,
                thread_Id: thread_Id,
                error: '',
                details: ''
            };
        } catch (error) {
            console.error('Failed to generate response:', error);
            return res = {
                success: false,
                error: 'Failed to generate response',
                details: error.message,
                message: '',
                thread_Id: thread_Id,
            };
        }
    },

    generateAnswer: async (req, res) => {
        const {query, thread_id} = req.body;
        try{
            if(!query){ 
                return {
                    error: 'Missing required fields',
                    details: 'Message is required'
                }
            }
            const resp = await axios.post('https://dfbf-38-188-110-250.ngrok-free.app/chat/v2',{query: query, thread_id: thread_id});
            const completionData = await resp.data;
            console.log(completionData);
            return res = {
                success: true,
                message: completionData.message,
                thread_id: thread_id,
                error: '',
                details: ''
            };
        }
        catch(error){
            console.error('Failed to generate response:', error);
            return res = {
                success: false,
                error: 'Failed to generate response',
                details: error.message,
                message: '',
                thread_id: thread_id,
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