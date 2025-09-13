import path from "path"
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
});

const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
  url: process.env.QDRANT_URL,
  collectionName: "uploaded_files",
});

const vectorStoreRetriever = vectorStore.asRetriever({k:2})

const filePath = path.join(process.cwd(), '/tmp/RahulGupta.pdf')

// TODO: modify this for other file types too
export const loadDocument = async(path : string) => {
    try{
    console.log(`loadDocument: Loading document from ${filePath}`)
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();
    console.log(`loadDocument: Document loaded from ${filePath}`)
    return docs;
    }
    catch(err) {
        console.log('loadDocument: Error loading document', err)
        throw err;
    }
   
}

export const addDocumentToVectorStore = async(docs : any[]) => {
    try{
        console.log(`addDocumentToVectorStore: Adding document to vector store`)
        await vectorStore.addDocuments(docs);
        console.log(`addDocumentToVectorStore: Document added to vector store`)
    }
    catch(err) {
        console.log('addDocumentToVectorStore: Error adding document to vector store', err)
        throw err
    }
}

export const queryVectorStore = async(query : string) => {
    try{
        const retreivedDocs = await vectorStoreRetriever.invoke(query)
        return retreivedDocs;
    }
    catch(err){
        console.log('queryVectorStore: Error querying vector store', err)
        throw err
    }
}
