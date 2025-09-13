// use default llm client
import OpenAI from "openai";
import client , {defaultLLMConfig} from "../agent/client";

export const INIT_SYSTEM_PROMPT = `
You are a helpful assistant, who is high in reasoning and is able to answer on the provided context. Note if the user query is related to the provided context, answer based on the context first, return the source which you used to determine as well in your answer like page number, column name, line etc. If the user query is not related to the context, answer based on your knowledge. If its not in context dont give any information. If you don't know the answer, just say that you don't know. Do not try to make up an answer.
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