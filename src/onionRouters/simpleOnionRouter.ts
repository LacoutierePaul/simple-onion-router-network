import bodyParser from "body-parser";
import express from "express";
import {BASE_ONION_ROUTER_PORT, BASE_USER_PORT, REGISTRY_PORT} from "../config";
import {generateRsaKeyPair, exportPubKey, exportPrvKey, exportSymKey, rsaEncrypt} from '../crypto';
import axios from 'axios';
import { rsaDecrypt, symDecrypt, importSymKey } from '../crypto';
import { error } from "console";
import {stringify} from "ts-jest";


export var lastMessageDestination : number | null = null;
export var lastReceivedEncryptedMessage : string | null = null;
export var lastReceivedDecryptedMessage : string | null = null;

export async function simpleOnionRouter(nodeId: number) {
  const onionRouter = express();
  onionRouter.use(express.json());
  onionRouter.use(bodyParser.json());

  // Generate a private and public key for the node
  const {publicKey, privateKey} = await generateRsaKeyPair();
  const pubKey = await exportPubKey(publicKey);


  // Add a route to get the private key
  onionRouter.get("/getPrivateKey", async (req, res) => {
    const prvKey = await exportPrvKey(privateKey);
    res.status(200).json({result: prvKey});
  });


  // TODO implement the status route
  onionRouter.get("/status", (req, res) => {
        res.status(200).send("live");
      }
  );

  onionRouter.get("/getLastReceivedEncryptedMessage", (req, res) => {
    res.status(200).json({result: lastReceivedEncryptedMessage})
  });

  onionRouter.get("/getLastReceivedDecryptedMessage", (req, res) => {
    res.status(200).json({result: lastReceivedDecryptedMessage})

  });

  onionRouter.get("/getLastMessageDestination", (req, res) => {
    res.status(200).json({result: lastMessageDestination})
  });

  onionRouter.post('/message', async (req, res) => {
    const { message } = req.body;

    // Log the received encrypted message
    console.log("Received encrypted message:", message);
    try {
      // Decrypt the outer layer of the message with RSA private key
      const decryptedSymKey = await rsaDecrypt(message.slice(0, 344), privateKey);
      // Decrypt the remaining message with the decrypted symmetric key
      const decryptedMessage = await symDecrypt(decryptedSymKey, message.slice(344));
      error("Encrypted message:", message);
      // Extract destination and remaining message
      const destination = parseInt(decryptedMessage.slice(0, 10), 10);
      const remainingMessage = decryptedMessage.slice(10);
      error("Decrypted message:", remainingMessage);
      await error("Actual Node : ", nodeId);
      await error("Destination:", destination);
      await error("Remaining message:", remainingMessage);
      // Forward the message to the next destination
      await axios.post(`http://localhost:${destination}/message`, {
        message: remainingMessage,
      });
        // Update the value of lastReceivedEncryptedMessage
        lastReceivedEncryptedMessage = message;
        // Update the value of lastReceivedDecryptedMessage
        lastReceivedDecryptedMessage = remainingMessage;
        // Update the value of lastMessageDestination
        lastMessageDestination = destination;


      // Send response
      res.status(200).send('Message forwarded');
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send('Error processing message');
    }
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
  const registryBody = {nodeId, pubKey};
  await axios.post(registryUrl, registryBody);
  return server;

}