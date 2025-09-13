// use default llm client
import OpenAI from "openai";
import client , {defaultLLMConfig} from "../agent/client";


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
    return response.choices[0].message;
    }
    catch(err) {
        console.log('Error in chat service ', err)
        throw err
    }

   
}


export default chat