import { useState } from "react";
import Groq from "groq-sdk";

export default function App() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [input, setInput] = useState("");

  const handleRoast = async () => {
    try {
      if (!input.trim()) return;
      setLoading(true);
      setResponse("");
      setError("");

      const cleanedInput = input.trim().replace(/\/+$/, "");
      const username = cleanedInput.split("/").pop();

      const githubToken = import.meta.env.VITE_GITHUB_TOKEN;
      const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;

      if (!githubToken) {
        throw new Error("Missing VITE_GITHUB_TOKEN in .env file!");
      }

      if (!groqApiKey) {
        throw new Error("Missing VITE_GROQ_API_KEY in .env file!");
      }

      const query = `
        query ($username: String!) {
          user(login: $username) {
            name
            bio
            company

            followers {
              totalCount
            }

            following {
              totalCount
            }

            contributionsCollection {
              totalCommitContributions
              totalPullRequestContributions
              totalIssueContributions
              totalRepositoryContributions
            }

            repositories(
              first: 8
              orderBy: {
                field: UPDATED_AT
                direction: DESC
              }
            ) {
              nodes {
                name
                description
                stargazerCount
                primaryLanguage {
                  name
                }

                object(expression: "HEAD:README.md") {
                  ... on Blob {
                    text
                  }
                }
              }
            }

            pullRequests(
              first: 5
              orderBy: {
                field: CREATED_AT
                direction: DESC
              }
            ) {
              nodes {
                title
                state
                repository {
                  nameWithOwner
                }
              }
            }
          }
        }
      `;

      const ghRes = await fetch(
        "https://api.github.com/graphql",
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${githubToken}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            query,
            variables: {
              username,
            },
          }),
        }
      );

      const ghData = await ghRes.json();

      if (ghData.errors || !ghData.data?.user) {
        const message =
          ghData.errors?.[0]?.message ||
          "GitHub user not found or token invalid!";

        throw new Error(message);
      }

      const groq = new Groq({
        apiKey: groqApiKey,
        dangerouslyAllowBrowser: true,
      });

      const roast = await groq.chat.completions.create({
        model: "openai/gpt-oss-20b",

        messages: [
          {
            role: "system",
            content:
              "You are a savage, witty tech comedian. Roast developers based on their GitHub profile. Be short, funny, clever, and brutally accurate. Avoid hateful or genuinely abusive content.",
          },

          {
            role: "user",
            content: `
Roast this GitHub developer.

Rules:
- 3-4 sentences
- Savage
- Mention specific GitHub stats when useful
- Mention their repositories when appropriate
- Don't make up facts
- Make it sound like a professional developer getting destroyed by a comedian

GitHub Profile:
${JSON.stringify(ghData.data.user)}
            `,
          },
        ],
      });

      setResponse(
        roast.choices[0]?.message?.content ||
        "No roast generated!"
      );
    } catch (err) {
      console.error("Debug Error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-50 min-h-screen w-full relative flex justify-center items-center p-4">

      <div className="absolute top-0 w-full p-2 text-center font-bold text-green-700 bg-zinc-100">
        😁 Welcome to GitRoast! Paste your username and get your GitHub roasted 😁
      </div>

      <div className="flex flex-col justify-center items-center gap-3 w-full">

        <label className="font-bold">
          Paste your GitHub Username Here:
        </label>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. torvalds"
          className="w-80 font-medium bg-zinc-200 p-3 rounded-xl text-sm text-zinc-800 focus:outline-1 outline-zinc-500"
          type="text"
        />

        <button
          onClick={handleRoast}
          disabled={loading}
          className="rounded-full px-5 py-3 font-bold bg-green-700 text-white disabled:opacity-50 cursor-pointer hover:bg-green-800 transition-all"
        >
          {!loading
            ? "Roast Me!"
            : "Cooking you...😆"}
        </button>

        {error && (
          <div className="font-medium text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-xl max-w-sm text-center">
            We're Sorry! Try again
          </div>
        )}

        {!error && response && (
          <div className="mt-4 p-4 bg-zinc-100 border border-zinc-300 tracking-tighter rounded-xl text-sm text-center w-[70%] font-semibold text-yellow-600">
            {response}
          </div>
        )}

      </div>
    </div>
  );
}