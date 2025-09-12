import OpenAI from "openai";
import LLMConfig from "@/config.json"

export type LLM_TYPES = keyof typeof LLMConfig

const LLM_USED: LLM_TYPES = 'gemini'

const USED_LLM_CONFIG = LLMConfig[LLM_USED]

Object.keys(LLMConfig).forEach(type => {
    LLMConfig[type as LLM_TYPES].apiKey = process.env[LLMConfig[type as LLM_TYPES].key] || ''
})

export const createLLMClient = (type ?: LLM_TYPES) => {

    // use default if type not provided or its openAI
    if(!type || type === 'openai') return new OpenAI(USED_LLM_CONFIG)
    const config = LLMConfig[type]
    return new OpenAI(config)

}


const defaultClient = createLLMClient(LLM_USED)
export const defaultLLMType = LLM_USED
export const defaultLLMConfig = USED_LLM_CONFIG
export default defaultClient