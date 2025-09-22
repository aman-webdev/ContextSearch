// import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import defaultClient, { defaultLLMConfig } from "../agent/client";
import search from "./tavily";


const prepareDoc = async (query : string) => {

    
    let webSearchResults
    if(process.env.USE_WEB_SEARCH)  webSearchResults= await search(query)

    const SYSTEM_PROMPT = process.env.USE_WEB_SEARCH ? 
    `You are an assistant who will receive an array in this format
    {"title" : "string", "content":"string"}
    You are supposed to study the array and return the combined / optminal result (You can even use your pretrained data in the response)
    `
    :
    `You are an assistant who is supposed to create a text document about user query based on pre-trained data.`

    const chat = await defaultClient.chat.completions.create({
        model: defaultLLMConfig.model,
        messages : [
            {
                role : "system",
                content :  SYSTEM_PROMPT
            },
            {
                role : "user",
                content : webSearchResults ?  JSON.stringify(webSearchResults) : query
            }
        ]
    })

    const result = chat.choices[0].message.content

    console.log(`prepareDoc : result, ${result}`)
    return result || ''
}

export default prepareDoc