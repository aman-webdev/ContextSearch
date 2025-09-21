import path from "path";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
// import { SRTLoader } from "@langchain/community/document_loaders/fs/srt";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveUrlLoader } from "@langchain/community/document_loaders/web/recursive_url";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { compile } from "html-to-text";
import { Document } from "@langchain/core/documents";
import pathCompleteExtName from "path-complete-extname"

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
 
});

const getVectorStore = async () => {
  return await QdrantVectorStore.fromExistingCollection(embeddings, {
    url: process.env.QDRANT_URL,
    collectionName: "uploaded_files",
    apiKey: process.env.QDRANT_API_KEY
  });
};

// TODO: modify this for other file types too
export const loadDocument = async (pathToLoad: string) => {
  try {
    console.log(`loadDocument: Loading document from ${pathToLoad}`);
    const ext = pathCompleteExtName(pathToLoad)
    const additionalDocMetadata = {
      fileName : path.basename(pathToLoad),
      uploadedAt : Date.now(),
      type : "FILE",
      ext 
    }

    let docs: Document[] = []

    if(ext === '.pdf'){
      const loader = new PDFLoader(pathToLoad);
      docs = await loader.load();
    }
    else {
      throw new Error(`File type ${ext} not supported. Only PDF files are allowed in this endpoint.`);
    }
   
    // console.log(docs[0],'docccc')

    for(const doc of docs) {
      doc.metadata = {...doc.metadata,...additionalDocMetadata}
    }
    console.log(`loadDocument: Document loaded from ${pathToLoad}`);
    return {docs, additionalDocMetadata};
  } catch (err) {
    console.log("loadDocument: Error loading document", err);
    throw err;
  }
};

export const addDocumentToVectorStore = async (docs: Document<Record<string, unknown>>[]) => {
  try {


    console.log(`addDocumentToVectorStore: Adding document to vector store`);

    const vectorStore = await getVectorStore();
    await vectorStore.addDocuments(docs)
    console.log(`addDocumentToVectorStore: Document added to vector store`);
  } catch (err) {
    console.log(
      "addDocumentToVectorStore: Error adding document to vector store",
      err
    );
    throw err;
  }
};

export const queryVectorStore = async (query: string) => {
  try {
    const vectorStore = await getVectorStore();
    const vectorStoreRetriever = vectorStore.asRetriever({ k: 2 });
    const retreivedDocs = await vectorStoreRetriever.invoke(query);
    return retreivedDocs;
  } catch (err) {
    console.log("queryVectorStore: Error querying vector store", err);
    throw err;
  }
};

export const queryVectorStoreWithFilter = async (query: string, metadata: Record<string, unknown>) => {
  try {
    console.log(`queryVectorStoreWithFilter: Querying with filter metadata:`, metadata);

    const vectorStore = await getVectorStore();

    // Try with filter first
    try {
      // Build filter conditions for Qdrant
      const filterConditions = Object.entries(metadata).map(([key, value]) => ({
        key,
        match: { value: value }
      }));

      const filter = {
        must: filterConditions
      };

      console.log(`queryVectorStoreWithFilter: Using filter:`, JSON.stringify(filter, null, 2));

      const retreivedDocs = await vectorStore.similaritySearch(query, 10, filter);
      console.log(`queryVectorStoreWithFilter: Found ${retreivedDocs.length} documents with filter`);
      return retreivedDocs;
    } catch (filterError) {
      console.log("queryVectorStoreWithFilter: Filter failed, trying without filter:", filterError);

      // Fallback to query without filter
      const retreivedDocs = await vectorStore.similaritySearch(query, 10);
      console.log(`queryVectorStoreWithFilter: Found ${retreivedDocs.length} documents without filter`);
      return retreivedDocs;
    }
  } catch (err) {
    console.log("queryVectorStoreWithFilter: Error querying vector store", err);
    throw err;
  }
};

export const websiteLoader = async (url: string) => {
  try {
    const loader = new RecursiveUrlLoader(url, {
      extractor: compile({
        wordwrap: 130,
        selectors: [
          { selector: "img", format: "skip" },
          { selector: "svg", format: "skip" }, // Also skip SVGs
        ],
      }),
      maxDepth: 0,
      excludeDirs: ["/docs/api/"],
    });

    const websiteDocs = await loader.load();

    if(!websiteDocs.length) throw new Error(`Could not load ${url}` )

    const sourceData = websiteDocs[0].metadata

    const additionalWebsiteMetadata = {
      source : url,
      uploadedAt : Date.now(),
      type : "WEBSITE"
    }

    for(const websiteDoc of websiteDocs) {
      websiteDoc.metadata = {...websiteDoc.metadata, ...additionalWebsiteMetadata}
    }


     

    return {websiteDocs,additionalWebsiteMetadata : {...additionalWebsiteMetadata,...sourceData}};
  } catch (err) {
    console.log("websiteLoader: Error loading website", err);
    throw err;
  }
};

export const splitTextToChunks = async (docs: Document<Record<string, unknown>>[]) => {
    const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 2000,
  chunkOverlap: 100,
});

const output = await splitter.splitDocuments(docs);
return output;
}
