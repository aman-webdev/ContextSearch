// import OpenAI from "openai";
import { createLLMClient } from "../agent/client";
import LLMConfig from "@/config.json"

const retrievalClient = createLLMClient("gemini")

const REFINE_USER_QUERY_PROMPT = `
You are an assistant whose main purpose is to refine the user query to make LLMs understand it better using your pre-trained data. 
There might be some typpos or something in the user query which might be wrong, you need to fix and return the refined query

Example:
User : How do debug nde.js
Assistant : How do i debug in Node.js
`


export const refineUserQuery = async (query : string) => {
    try{
        const response = await retrievalClient.chat.completions.create({
            model : LLMConfig['gemini'].model,
            messages : [
                {
                    role : "system",
                    content : REFINE_USER_QUERY_PROMPT
                },
                {
                    role : "user",
                    content : query
                }
            ]
        })
        if(!response?.choices?.length) throw new Error('Could not get response')

        return response.choices[0].message.content

    }
    catch(err){
        console.error(`refineUserQuery : ${err}`)
    }
}