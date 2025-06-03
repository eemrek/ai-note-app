const axios = require('axios');
require('dotenv').config();

const HUGGINGFACE_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
const API_BASE_URL = 'https://api-inference.huggingface.co/models/';

// Helper function to call Hugging Face Inference API
async function queryHuggingFaceModel(modelId, payload) {
  try {
    const response = await axios.post(`${API_BASE_URL}${modelId}`, payload, {
      headers: { Authorization: `Bearer ${HUGGINGFACE_API_TOKEN}` },
    });
    return response.data;
  } catch (error) {
    console.error(`Error querying model ${modelId}:`, error.response ? error.response.data : error.message);
    // If model is loading, Hugging Face returns 503 with estimated_time
    if (error.response && error.response.status === 503 && error.response.data && error.response.data.estimated_time) {
      throw new Error(`Model ${modelId} is currently loading. Estimated time: ${error.response.data.estimated_time.toFixed(1)}s. Please try again shortly.`);
    }
    throw new Error(`Error with model ${modelId}: ${error.message}`);
  }
}

// @desc    Analyze note content with AI using Hugging Face models
// @route   POST /api/ai/analyze
// @access  Private
exports.analyzeNote = async (req, res) => {
  const { content } = req.body;

  if (!content || content.trim() === '') {
    return res.status(400).json({ msg: 'İçerik analiz için gereklidir.' });
  }

  if (!HUGGINGFACE_API_TOKEN) {
    console.error('Hugging Face API token not found. Please set HUGGINGFACE_API_TOKEN in your .env file.');
    return res.status(500).json({ msg: 'AI servisi yapılandırma hatası. API anahtarı eksik.' });
  }

  try {
    console.log(`Hugging Face ile içerik özetleniyor (uzunluk: ${content.length})...`);

    const summarizationPayload = { inputs: content };
    
    const summaryResult = await queryHuggingFaceModel('facebook/bart-large-cnn', summarizationPayload)
                                .catch(e => ({ error: e.message, type: 'summary' }));

    const analysis = {};

    if (summaryResult && !summaryResult.error && summaryResult[0] && summaryResult[0].summary_text) {
      analysis.summary = summaryResult[0].summary_text;
    } else {
      analysis.summary = summaryResult.error || 'Özet alınamadı.';
      console.warn('Özetleme hatası veya geçersiz sonuç:', summaryResult);
    }

    res.json(analysis);

  } catch (error) {
    console.error('AI özetleme sırasında genel hata:', error.message);
    res.status(500).json({ msg: `AI özetleme sırasında hata: ${error.message}` });
  }
};
