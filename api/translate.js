const axios = require('axios');

module.exports = async (req, res) => {
    const { text, targetLang } = req.body;
    const DEEPL_API_KEY = process.env.DEEPL_API_KEY;

    try {
        const response = await axios.post(
            'https://api-free.deepl.com/v2/translate',
            null,
            {
                params: {
                    auth_key: DEEPL_API_KEY,
                    text: text,
                    target_lang: targetLang
                }
            }
        );
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Translation failed' });
    }
};

