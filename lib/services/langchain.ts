import path from "path";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
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

const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
  url: process.env.QDRANT_URL,
  collectionName: "uploaded_files",
});

const vectorStoreRetriever = vectorStore.asRetriever({ k: 2 });

const filePath = path.join(process.cwd(), "/tmp/RahulGupta.pdf");

// TODO: modify this for other file types too
export const loadDocument = async (pathToLoad: string) => {
  try {
    console.log(`loadDocument: Loading document from ${pathToLoad}`);
    const additionalDocMetadata = {
      fileName : path.basename(pathToLoad),
      uploadedAt : Date.now(),
      type : "DOCUMENT",
      ext : pathCompleteExtName(pathToLoad)
    }
    const loader = new PDFLoader(pathToLoad);
    const docs = await loader.load();

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

export const addDocumentToVectorStore = async (docs: Document<Record<string, any>>[]) => {
  try {
    console.log(`addDocumentToVectorStore: Adding document to vector store`);
    await vectorStore.addDocuments(docs);
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
    const retreivedDocs = await vectorStoreRetriever.invoke(query);
    return retreivedDocs;
  } catch (err) {
    console.log("queryVectorStore: Error querying vector store", err);
    throw err;
  }
};

export const queryVectorStoreWithFilter = async (query: string, metadata: Record<string, any>) => {
  try {
    console.log(`queryVectorStoreWithFilter: Querying with filter metadata:`, metadata);
    
    // Build filter conditions from metadata
    const filterConditions = Object.entries(metadata).map(([key, value]) => ({
      key: `metadata.${key}`,
      match: { value }
    }));
    
    const retreivedDocs = await vectorStore.similaritySearch(query, 10, {
      must: filterConditions
    });
    console.log(`queryVectorStoreWithFilter: Found ${retreivedDocs.length} documents`);
    return retreivedDocs;
  } catch (err) {
    console.log("queryVectorStoreWithFilter: Error querying vector store with filter", err);
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
      maxDepth: 1,
      excludeDirs: ["/docs/api/"],
    });

    const websiteDocs = await loader.load();

    const additionalWebsiteMetadata = {
      websiteURL : url,
      uploadedAt : Date.now(),
      type : "WEBSITE"
    }

    for(const websiteDoc of websiteDocs) {
      websiteDoc.metadata = {...websiteDoc.metadata, ...additionalWebsiteMetadata}
    }


     

    return {websiteDocs,additionalWebsiteMetadata};
  } catch (err) {
    console.log("websiteLoader: Error loading website", err);
    throw err;
  }
};

export const splitTextToChunks = async (docs : Document<Record<string, any>>[]) => {
    const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

const output = await splitter.splitDocuments(docs);
return output;
}
