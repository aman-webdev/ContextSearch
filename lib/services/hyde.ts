// import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import defaultClient, { defaultLLMConfig } from "../agent/client";
import search from "./tavily";


const prepareDoc = async (query : string) => {
    const webSearchResults = await search(query)

    const SYSTEM_PROMPT = 
    `You are an assistant who will receive an array in this format
    {"title" : "string", "content":"string"}
    You are supposed to study the array and return the combined / optminal result (You can even use your pretrained data in the response)
    `

    const chat = await defaultClient.chat.completions.create({
        model: defaultLLMConfig.model,
        messages : [
            {
                role : "system",
                content :  SYSTEM_PROMPT
            },
            {
                role : "user",
                content : JSON.stringify(webSearchResults)
            }
        ]
    })

    const result = chat.choices[0].message.content

    console.log(`prepareDoc : result, ${result}`)
    return result || ''
}

export default prepareDoc