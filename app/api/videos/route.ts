import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export const GET = async (request: NextRequest) => {
  try {
    const videos = await prisma.video.findMany({
      orderBy: {
        uploadedAt: 'desc'
      },
      include: {
        uploadedDocument: true
      }
    });

    return new Response(JSON.stringify({
      success: true,
      data: videos
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching videos:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch videos'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const DELETE = async (request: NextRequest) => {
  try {
    const { id } = await request.json();

    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Video ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await prisma.video.delete({
      where: { id }
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Video deleted successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error deleting video:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to delete video'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};