import prisma from "@/lib/prisma";
import chat, { INIT_SYSTEM_PROMPT } from "@/lib/services/chat";
import prepareDoc from "@/lib/services/hyde";
import {
  queryVectorStore,
  queryVectorStoreWithFilter,
} from "@/lib/services/langchain";
import { refineUserQuery } from "@/lib/services/refineQuery";

interface AdditionalMetadata {
  fileName: string;
  type: "DOCUMENT" | "WEBSITE";
  ext: string;
}

interface ChatRequest {
  query: string;
  additionalMetadata?: AdditionalMetadata;
}

export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    const { query, additionalMetadata } = body as ChatRequest;

    if (!query || query.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Query is required" }), {
        status: 400,
      });
    }

    const refinedQuery = await refineUserQuery(query)

    const hypotheticalDoc = await prepareDoc(refinedQuery || '')

    const retreivedDocs = additionalMetadata
      ? await queryVectorStoreWithFilter(hypotheticalDoc || query, additionalMetadata)
      : await queryVectorStore(hypotheticalDoc || query);

    // Format retrieved documents properly
    const contextContent = retreivedDocs
      .map((doc, index) => {
        const metadata = doc.metadata;
        const content = doc.pageContent;

        let sourceInfo = "";
        if (metadata.type === "DOCUMENT") {
          sourceInfo = `[Document: ${metadata.fileName}]`;
        } else if (metadata.type === "WEBSITE") {
          sourceInfo = `[Website: ${metadata.source || metadata.websiteURL}]`;
        } else if (metadata.type === "YOUTUBE_TRANSCRIPT") {
          sourceInfo = `[YouTube: ${metadata.title} - ${metadata.source}]`;
        }

        return `${sourceInfo}\n${content}\n`;
      })
      .join("\n---\n");

    const SYSTEM_PROMPT = `${INIT_SYSTEM_PROMPT}

    ## Context Documents:
    ${contextContent}
`;
   

    const chatResponse = await chat( refinedQuery || query, [], SYSTEM_PROMPT);

    await prisma.chat.createMany({
      data: [
        {
          role: "user",
          content: query,
        },
        {
          role: "assistant",
          content: chatResponse || "",
        },
      ],
    });

    return new Response(JSON.stringify({ data: chatResponse }), {
      status: 200,
    });
  } catch (err) {
    console.log("chat : ", err);
    return new Response("Something went wrong", { status: 500 });
  }
};

export const GET = async (request: Request) => {
  const allChats = await prisma.chat.findMany();
  return new Response(JSON.stringify({ data: allChats }), { status: 200 });
};
