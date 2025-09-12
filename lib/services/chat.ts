// use default llm client
import OpenAI from "openai";
import client , {defaultLLMConfig} from "../agent/client";


const chat = async(userQuery : string, messages : OpenAI.Chat.ChatCompletionMessageParam[]) => {

    try{

    // TODO: first insert the message in db and send directly
    //  const userMessage : OpenAI.Chat.ChatCompletionMessageParam = {
    //     role : 'user',
    //     content : userQuery
    // }
    // messages.push(userMessage)
     const response = await client.chat.completions.create({
        model : defaultLLMConfig.model, 
        messages : messages
    
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