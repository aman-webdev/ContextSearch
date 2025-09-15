import prisma from "@/lib/prisma";
import checkIfValidURL from "@/lib/services/checkIfURLIsValid";
import {
  addDocumentToVectorStore,
  splitTextToChunks,
  websiteLoader,
} from "@/lib/services/langchain";

export const POST = async (request: Request) => {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      return new Response(JSON.stringify({ error: "Invalid content type" }), {
        status: 400,
      });
    }

    const body = await request.json();
    const { url } = body as { url: string };

    if (!url || url.trim().length === 0)
      return new Response(JSON.stringify({ error: "URL is required" }), {
        status: 400,
      });

    const isValidURL = checkIfValidURL(url);
    if (!isValidURL) {
      return new Response(JSON.stringify({ error: "Invalid URL" }), {
        status: 400,
      });
    }

    const { websiteDocs, additionalWebsiteMetadata } = await websiteLoader(url);
    const websiteChunks = await splitTextToChunks(websiteDocs);

    await addDocumentToVectorStore(websiteChunks);

    const result = await prisma.uploadedDocuments.create({
      data: {
        documentType: additionalWebsiteMetadata.type,
        source: additionalWebsiteMetadata.source,
      },
    });

    return new Response(
      JSON.stringify({
        message: `Website ${url} processed successfully`,
        data: result,
      }),
      { status: 201 }
    );
  } catch (err) {
    console.log("website route: ", err);
    return new Response("Something went wrong", { status: 500 });
  }
};
