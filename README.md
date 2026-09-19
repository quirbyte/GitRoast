# 🪙 GitRoast

An AI-powered web application that fetches a developer's GitHub profile data using the GitHub GraphQL API and generates brutal, witty, and personalized tech roasts using LLM APIs.

---

## ✨ Features

* **In-Depth GitHub Metrics**: Pulls contribution stats, repository details, primary languages, pull requests, and README contents via GitHub GraphQL API.
* **AI-Generated Roasts**: Integrates with Groq / OpenAI to deliver customized, hilarious developer roasts.
* **Clean UI**: Built with React and styled using Tailwind CSS for a fast, responsive user experience.
* **Input Flexibility**: Accepts both raw GitHub usernames and full profile URLs.

---

## 🛠️ Tech Stack

* **Frontend**: React (Vite)
* **Styling**: Tailwind CSS
* **APIs Used**: 
  * [GitHub GraphQL API](https://docs.github.com/en/graphql)
  * [Groq API](https://groq.com/)

---

### 📖 How It Works

* Enter a GitHub username or paste a GitHub profile URL into the input field.

* The app queries the GitHub GraphQL API to compile user stats, PR activity, and top repositories.

* The extracted profile context is passed into the AI model with a custom system prompt to     
  generate a tailored roast.

### 🛡️ License

**Distributed under the MIT License**