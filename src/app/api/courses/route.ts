export async function GET() {
  const resp = await fetch(
    "https://courselistings.wpi.edu/assets/prod-data.json",
  );

  if (!resp.ok) {
    return new Response(JSON.stringify({ error: "Upstream failed" }), {
      status: 502,
    });
  }

  const data = await resp.json();

  return Response.json(data);
}
