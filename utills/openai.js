const { Configuration, OpenAIApi } = require("openai");



export default async function transcribe(buffer) {
    const configuration = new Configuration({
        apiKey: config.get('openAI.apiKey'),
    });
    const openai = new OpenAIApi(configuration);
    const response = await openai.createTranscription(
        buffer, 
        "whisper-1",
        undefined,
        'json',
        1,
        'en'
    )
    return response;
}