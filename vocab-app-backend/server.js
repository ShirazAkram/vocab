const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const axios = require('axios');
const Word = require('./models/Word');

const app = express();
app.use(express.json()); 

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.log('Error connecting to MongoDB', error);
});

app.get('/api/words', async (req, res) => {
    try {
        const words = await Word.find({});
        res.json(words);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch words' });
    }
});

app.post('/api/words', async (req, res) => {
    const { word } = req.body;

    try {
        const cachedWord = await Word.findOne({ word });
        if (cachedWord) {
            return res.json(cachedWord);
        }

        const requestUrl = `https://od-api-sandbox.oxforddictionaries.com/api/v2/entries/en-gb/${word}`;
        console.log('Requesting URL:', requestUrl);

        const response = await axios.get(requestUrl, {
            headers: {
                app_id: process.env.APP_ID,
                app_key: process.env.APP_KEY,
            },
        });

        const wordData = response.data;
        const newWord = new Word({
            word: wordData.word,
            meaning: wordData.results[0].lexicalEntries[0].entries[0].senses[0].definitions[0],
            phonetic: wordData.results[0].lexicalEntries[0].pronunciations[0].phoneticSpelling,
            examples: wordData.results[0].lexicalEntries[0].entries[0].senses[0].examples.map(e => e.text),
        });

        await newWord.save();
        res.json(newWord);
    } catch (error) {
        console.error('Error fetching word data:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to fetch word data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
