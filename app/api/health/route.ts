export const GET = async(request : Request) => {
    // console.log(request)
    return new Response(JSON.stringify(request), { status: 200 });
}