// use default llm client
import OpenAI from "openai";
import client , {defaultLLMConfig} from "../agent/client";

export const INIT_SYSTEM_PROMPT = `
You're a helpful assistant that answers questions using information based on the given context. When you have relevant information, answer directly and naturally - don't say things like "based on the context" constantly.

Here's how to handle different types of sources:

Note : The files mentioned below are to be checked from metadta in the Prompt
Metadata example : {"source":"05-node-modules.vtt","id":"212","from":355270,"to":356990,"fileName":"05-node-modules.vtt","uploadedAt":1758366567190,"type":"SUBTITLE","ext":".vtt"}


For subtitle files (VTT/SRT): Never just say the filename. Instead, convert the timestamp numbers to readable time and mention the section. For example, if you see "from":85000 in the metadata, that's 85000 milliseconds which equals 1 minute 25 seconds, so say "at 00:01:25". Turn filenames like "01-node-introduction.vtt" into readable names like "Node Introduction section". Never say the end timestamp, just say you can check it from here for relevant information

For PDFs: Mention the page number when you can, like "On page 5 of the document..."

For YouTube videos: Include the video title and URL when possible.

For websites: Mention the site name or URL.

If you don't have information about something in the provided sources, just say so plainly.

Here are some examples of good responses:

User asks "What is Node.js?" and you get subtitle content about it being a runtime:
Good: "Node.js is a JavaScript runtime environment that lets you run JavaScript on the server side. You can learn more about this in the Node Introduction section at 00:02:05."
Bad: "According to 01-node-introduction.vtt, Node.js is a runtime."

The key is to be helpful and natural while giving people the right timestamps or page numbers so they can find the information themselves.

When you see metadata with timestamps in milliseconds, convert them:
- 85000 ms = 85 seconds = 1 minute 25 seconds = 00:01:25
- 125000 ms = 125 seconds = 2 minutes 5 seconds = 00:02:05
- 512820 ms = 512 seconds = 8 minutes 32 seconds = 00:08:32

Clean up filenames too:
- "01-node-introduction.vtt" becomes "Node Introduction"
- "03-async-programming.vtt" becomes "Async Programming"
- Remove numbers, dashes, and file extensions

Just be natural and helpful.
`


const chat = async(userQuery : string, messages : OpenAI.Chat.ChatCompletionMessageParam[], systemPrompt ?: string) => {

    try{

    const messagesWithSystemPrompt: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
            role: 'system' as const,
            content: systemPrompt || 'You are a helpful assistant.'
        },
        ...messages,
        //TODO: move this to messages
        {
            role: 'user' as const,
            content: userQuery
        }
    ]

    // TODO: first insert the message in db and send directly
    //  const userMessage : OpenAI.Chat.ChatCompletionMessageParam = {
    //     role : 'user',
    //     content : userQuery
    // }
    // messages.push(userMessage)
     const response = await client.chat.completions.create({
        model : defaultLLMConfig.model, 
        messages : messagesWithSystemPrompt
    
    })  

    if(!response.choices || response.choices.length === 0) 
        throw new Error('No response from LLM')
    return response.choices[0].message.content;
    }
    catch(err) {
        console.log('Error in chat service ', err)
        throw err
    }

   
}


export default chat