import chat, { INIT_SYSTEM_PROMPT } from "@/lib/services/chat";
import { queryVectorStore } from "@/lib/services/langchain";


export const POST = async(request: Request) => {
    try{
        const body = await request.json()
        const {query}   = body  as {query: string}
        console.log(query,'query')

        if(!query || query.trim().length === 0) {
            return new Response(JSON.stringify({error:'Query is required'}), { status: 400 });
        }

        const retreivedDocs = await queryVectorStore(query)
        console.log('Retreived docs', retreivedDocs.length)
        

        // TODO: move this to DB

        const SYSTEM_PROMPT = `${INIT_SYSTEM_PROMPT}
        ${retreivedDocs && retreivedDocs.length > 0 ? `Context:\n ${retreivedDocs.map((d, idx) => `Source ${idx+1}: ${d.pageContent}`).join('\n')}` : 'No relevant context found in the documents.'}
        `

        const chatResponse = await chat(query, [], SYSTEM_PROMPT)

        return new Response(JSON.stringify({data: chatResponse}), { status: 200 });

    }
    catch(err){
        console.log('chat : ',err)
        return new Response('Something went wrong', { status: 500 });
    }
 


}