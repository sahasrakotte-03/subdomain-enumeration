# 🔎 Subdomain Enumeration

A cybersecurity reconnaissance tool designed to discover and enumerate **subdomains of authorized domains**. The project provides a simple interface for security researchers and students to understand the subdomain discovery process and identify the attack surface of a domain.

> ⚠️ **Ethical Use:** Use this tool only on domains that you own or have explicit permission to test.

## 🚀 Features

* 🔍 Subdomain discovery and enumeration
* 🌐 Domain-based reconnaissance
* 📊 Organized results for discovered subdomains
* 🛡️ Designed for authorized security testing
* 💻 Simple and user-friendly web interface
* ⚡ Fast development using Vite and TypeScript
* 🤖 AI-assisted functionality using Gemini API

## 🛠️ Technologies Used

* **Frontend:** HTML, TypeScript
* **Build Tool:** Vite
* **Backend:** Node.js / TypeScript
* **AI:** Google Gemini API
* **Package Manager:** npm
* **Version Control:** Git & GitHub

## 📁 Project Structure

```text
subdomain-enumeration/
│
├── src/
│   └── Application source files
│
├── .env.example
├── .gitignore
├── index.html
├── metadata.json
├── package.json
├── server.ts
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/sahasrakotte-03/subdomain-enumeration.git
```

### 2. Open the project

```bash
cd subdomain-enumeration
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure the API key

Create a `.env.local` file and add your Gemini API key:

```env
GEMINI_API_KEY=your_api_key_here
```

**Do not upload your actual API key to GitHub.**

### 5. Start the application

```bash
npm run dev
```

The application will start locally using the Vite development server.

## 🔍 What is Subdomain Enumeration?

Subdomain enumeration is the process of discovering subdomains associated with a main domain.

For example:

```text
example.com
│
├── www.example.com
├── api.example.com
├── mail.example.com
├── admin.example.com
└── dev.example.com
```

Finding these subdomains helps security professionals understand an organization's **external attack surface** and identify systems that may require additional security review.

Tools such as Subfinder also use passive sources to discover subdomains without directly attacking the target infrastructure.

## 🔐 Security Use Cases

This project can be used for:

* Authorized penetration testing
* Security reconnaissance
* Attack-surface discovery
* Bug bounty research on permitted targets
* Cybersecurity education
* Understanding DNS and subdomain structures

## 📋 Example Workflow

```text
Enter Authorized Domain
        ↓
Domain Validation
        ↓
Subdomain Enumeration
        ↓
Process Discovered Results
        ↓
Display Subdomains
        ↓
Security Analysis
```

## ⚠️ Responsible Usage

This project is intended for **educational and authorized cybersecurity purposes only**.

Do not use it to enumerate or investigate domains without permission. Unauthorized reconnaissance may violate organizational policies, terms of service, or applicable laws.

Only test:

* Your own domains
* Lab environments
* CTF environments
* Bug-bounty targets within their defined scope
* Systems where you have explicit authorization

## 📌 Future Improvements

* [ ] Add multiple passive enumeration sources
* [ ] Add DNS record lookup
* [ ] Add live-subdomain verification
* [ ] Add export to CSV/JSON
* [ ] Add subdomain status codes
* [ ] Add response-time information
* [ ] Add visualization of discovered subdomains
* [ ] Add scan history
* [ ] Add authentication and user accounts
* [ ] Improve reporting and security analysis

## 👩‍💻 Author

**Sahasra Kotte**

GitHub:
https://github.com/sahasrakotte-03

## ⭐ Project

If you find this project useful for learning cybersecurity and reconnaissance, consider giving the repository a ⭐ on GitHub.
