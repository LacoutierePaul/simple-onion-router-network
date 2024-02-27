import bodyParser from "body-parser";
import express from "express";
import { BASE_ONION_ROUTER_PORT } from "../config";
import { lastReceivedEncryptedMessage, lastReceivedDecryptedMessage, lastMessageDestination } from "./../users/user";
import { generateRsaKeyPair, exportPubKey, exportPrvKey } from '../crypto';
import axios from 'axios';


export async function simpleOnionRouter(nodeId: number) {
  const onionRouter = express();
  onionRouter.use(express.json());
  onionRouter.use(bodyParser.json());

  // Generate a private and public key for the node
  const { publicKey, privateKey } = await generateRsaKeyPair();
  const pubKey = await exportPubKey(publicKey);



  // Add a route to get the private key
  onionRouter.get("/getPrivateKey", async (req, res) => {
    const prvKey = await exportPrvKey(privateKey);
    res.status(200).json({ result: prvKey });
  });


  // TODO implement the status route
  onionRouter.get("/status", (req, res) => {
        res.status(200).send("live");
      }
  );

  onionRouter.get("/getLastReceivedEncryptedMessage", (req, res) => {
    res.status(200).json({result : lastReceivedEncryptedMessage})
  });

  onionRouter.get("/getLastReceivedDecryptedMessage", (req, res) => {
    res.status(200).json({result : lastReceivedDecryptedMessage})

  });

  onionRouter.get("/getLastMessageDestination", (req, res) => {
    res.status(200).json({result : lastMessageDestination})
  });

  const server = onionRouter.listen(BASE_ONION_ROUTER_PORT + nodeId, () => {
    console.log(
        `Onion router ${nodeId} is listening on port ${
            BASE_ONION_ROUTER_PORT + nodeId
        }`
    );
  });

    // Register the node in the registry
    const registryUrl = `http://localhost:8080/registerNode`;
    const registryBody = { nodeId, pubKey };
    await axios.post(registryUrl, registryBody);





  return server;
}