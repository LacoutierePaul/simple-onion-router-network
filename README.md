# 🧅 simple-onion-router-network 🧅

[![TypeScript](https://img.shields.io/badge/TypeScript-4.9-blue?logo=typescript&style=flat-square)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js->=18-green?logo=node.js&style=flat-square)](https://nodejs.org/)
[![Tests](https://img.shields.io/badge/tests-passed-brightgreen?style=flat-square)](#)  

---

## 🚀 Project Overview

This repository provides the basic structure needed for an onion routing network, including nodes, users, and a nodes registry.

**My goal was to implement the inner workings of the onion routing protocol within this structure**, enabling secure message routing through the network.

Note: To simplify the implementation, response handling is not covered — the network only supports sending messages without expecting replies.

---

## 🧩 Core Components

- **Nodes:** Onion routers that forward traffic between other nodes or between users and nodes (entry and exit nodes).
- **Users:** Network users who can send and receive messages.
- **Nodes Registry:** Maintains a list of nodes, including IP addresses and RSA public keys. Users can request this list, and nodes can register themselves.

---

## ✅ What I Did

- Implemented the inner workings of the onion routing protocol as per project guidelines.
- Ensured secure routing of messages through the network using layered encryption.
- Completed all unit tests with full marks.
- Used Node.js (v18+) with built-in crypto, express, and body-parser packages.

---

## ⚙️ Setup & Usage

### Requirements
- Node.js version **18** or higher.

### Installation
```bash
npm install
```

### Runing Tests
```bash
npm run test
```

### Running the Network Manually
```bash
npm run start
```

---

## 🏆 Grading

- Successfully passed all unit tests (20/20 points).  
- Implementation is original and completed individually, following the exercise rules.
