import {tavily} from "@tavily/core"

const tavilyClient = tavily({
    apiKey : process.env.TAVILY_API_KEY || ''
})

const search = async(query : string) => {
    const result = await tavilyClient.search(query)
    const contextResults = result.results.map(({title,content})=>{
        return {
            title ,
            content
        }
    })

    return contextResults
}

export default search