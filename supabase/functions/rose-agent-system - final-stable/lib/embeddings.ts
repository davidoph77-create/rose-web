const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";

export async function createEmbedding(text: string): Promise<number[] | null> {
  try {

    const response = await fetch(
      "https://api.openai.com/v1/embeddings",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "text-embedding-3-small",
          input: text,
        }),
      },
    );

    if (!response.ok) {
      console.error(await response.text());
      return null;
    }

    const data = await response.json();

    return data.data[0].embedding;

  } catch (error) {
    console.error("Embedding error:", error);
    return null;
  }
}