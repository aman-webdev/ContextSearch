// one time script to create collection and payload indexes in qdrantdb
import "dotenv/config"
import { QdrantClient } from "@qdrant/js-client-rest";

const payloadIndexes : any = [
    {
        'field_name' : 'metadata.source',
        'field_schema' : "keyword"
    },
       {
        'field_name' : 'metadata.type',
        'field_schema' : "keyword"
    },
       {
        'field_name' : 'metadata.ext',
        'field_schema' : "keyword"
    },
       {
        'field_name' : 'metadata.uploadedAt',
        'field_schema' : "datetime"
    },

    {
        'field_name' : 'metadata.title',
        'field_schema' : "keyword"
    },
]
const qdrantClient = new QdrantClient({url: process.env.QDRANT_URL, apiKey : process.env.QDRANT_API_KEY,checkCompatibility :false});


const createIndexes = async() => {
    await qdrantClient.createCollection("uploaded_files",{
    vectors: {     // 👈 matches LangChain
      size: 1536, // your embedding dimension
      distance: "Cosine",
  },
    })
    for(const idx of payloadIndexes) {

        await qdrantClient.createPayloadIndex("uploaded_files",idx)
        console.log(`created : , ${idx.field_name}`)
    }
}


createIndexes()