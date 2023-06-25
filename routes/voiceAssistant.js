const express = require('express');
const router = express.Router();
const config = require('config')
const multer = require('multer');
const { Configuration, OpenAIApi } = require("openai");
const { Readable } = require('stream');
const fs = require('fs');
const gtts = require('node-gtts')('en');
const path = require('path');


router.get('/', (req, res) => {
    res.send('Hi, I\'m a smart voice assistant');
});


//get audio file input in a form, create a response file and send file path
// multer is used to get file 
router.post('/assist', multer().single('audioInputFile'), async(req, res) => {
    try {
        // multer, as a middleware, adds file in req object
        buffer = req.file.buffer;
        // convert buffer into stream
        const readableStream = Readable.from(buffer);
        readableStream.path = 'audioInputFile.webm';

        // create transcription from given audio input file using openAI whisper model
        // configure openAI with openAI key
        const configuration = new Configuration({
            apiKey: config.get('openAI.apiKey'),
        });
        const openai = new OpenAIApi(configuration);
        const openAITranscriptionResponse = await openai.createTranscription(
            readableStream,
            "whisper-1", 
            undefined, 
            'json', 
            1, 
            'en'
        );
        
        // get transcription, i.e, text of audion input from response object
        let textOfAudioInput = openAITranscriptionResponse.data.text;
        console.log('inputAudioText:', textOfAudioInput);

        // default result from OpenAI(Just put for testing)
        let resFromOpenAIGPT = '';

        // Ask question(here quesion is textOfAudioInput string) to openAI to get answer
        // const openai = new OpenAIApi(configuration);
        // skipping upper line because we have already configured openAI
        // this openAI object creation can be handled efficiently by creating a separate
        // util module for it, so that, for each connection, we don't have to create a 
        // new openAI object.
        const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{"role": "system", "content": "You are a helpful assistant."}, 
            {role: "user", content: textOfAudioInput}],
        });
        resFromOpenAIGPT = completion.data.choices[0].message.content;
        console.log('GPT response:', resFromOpenAIGPT);
        // create audio file of the text response from GPT
        // save file name as a timestamp to keep it unique.
        let fileName = `audioOutput${Date.now()}.webm`;
        let filepath = path.join(appRoot,config.get('staticFilePath'), fileName);
        gtts.save(filepath, resFromOpenAIGPT, () => {
            console.log('Saved audio file');
            // delete the created file after sometime, to save memory
            setTimeout(()=>deleteCreatedFile(filepath), 1000 * config.get('delOutputFileAfter'));
            res.send({audioOutputFilePath: fileName});
        });
    }
    catch(error) {
        // Better to use logger libraries, like, winston
        console.log('Got into exception:', error);
    }
})
module.exports = router;


function deleteCreatedFile(filepath) {
    fs.unlinkSync(filepath);
}