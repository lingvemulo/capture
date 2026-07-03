export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/transcribe") {
      if (request.method !== "POST") {
        return json({ error: "Method not allowed" }, 405);
      }
      return transcribe(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}

async function transcribe(request, env) {
  if (!env.DEEPGRAM_API_KEY) {
    return json(
      {
        error:
          "Transcription isn't set up yet. Run: npx wrangler pages secret put DEEPGRAM_API_KEY",
      },
      503
    );
  }

  const contentType = request.headers.get("content-type") || "audio/webm";

  try {
    const dgUrl = new URL("https://api.deepgram.com/v1/listen");
    dgUrl.searchParams.set("model", "nova-3");
    dgUrl.searchParams.set("language", "en");
    dgUrl.searchParams.set("smart_format", "true");

    // Stream the audio body straight through — never buffer it in the Worker.
    const dgRes = await fetch(dgUrl, {
      method: "POST",
      headers: {
        Authorization: `Token ${env.DEEPGRAM_API_KEY}`,
        "Content-Type": contentType,
      },
      body: request.body,
    });

    if (!dgRes.ok) {
      const detail = await dgRes.text();
      console.error(
        JSON.stringify({
          event: "deepgram_error",
          status: dgRes.status,
          detail: detail.slice(0, 500),
        })
      );
      return json({ error: `Transcription service error (${dgRes.status})` }, 502);
    }

    const data = await dgRes.json();
    const alt = data?.results?.channels?.[0]?.alternatives?.[0];
    return json({
      transcript: alt?.transcript ?? "",
      confidence: alt?.confidence ?? null,
    });
  } catch (err) {
    console.error(
      JSON.stringify({ event: "transcribe_exception", message: err?.message })
    );
    return json({ error: "Transcription failed — please try again" }, 500);
  }
}
