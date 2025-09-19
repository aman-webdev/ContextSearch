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

    const userId = request.headers.get("x-user-id")
    if(!userId) return new Response('',{status:401})
    console.log(userId,'userId here')

    if (!query || query.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Query is required" }), {
        status: 400,
      });
    }

     // Get current user to access chatHistory
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { chatHistory: true, type: true }
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    // Check message limits based on user type
    const currentChatHistory = Array.isArray(user.chatHistory) ? user.chatHistory : [];
    const messageLimit = user.type === 'GUEST' ? 10 : 50;

    console.log(currentChatHistory.length,'cur chat')

    if (currentChatHistory.length  >= messageLimit) {
      return new Response(JSON.stringify({
        error: `Message limit reached (${messageLimit} messages). ${user.type === 'GUEST' ? 'Please register for more messages.' : ''}`,
        limitReached: true
      }), {
        status: 429,
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

   

    // Add new messages to chat history
    const newMessages = [
      {
        role: "user",
        content: query,
        timestamp: new Date().toISOString()
      },
      {
        role: "assistant",
        content: chatResponse || "",
        timestamp: new Date().toISOString()
      }
    ];

    await prisma.user.update({
      where: { id: userId },
      data: {
        chatHistory: {
          push: newMessages
        }
      }
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
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { chatHistory: true }
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    // Flatten chat history - convert array of message pairs to flat array
    const chatHistory = Array.isArray(user.chatHistory) ? user.chatHistory : [];
    const flattenedHistory = chatHistory.flat();

    return new Response(JSON.stringify({ data: flattenedHistory }), { status: 200 });

  } catch (error) {
    console.error('Get chat history error:', error);
    return new Response(JSON.stringify({ error: "Failed to fetch chat history" }), {
      status: 500
    });
  }
};
