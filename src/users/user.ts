import bodyParser from "body-parser";
import express from "express";
import {BASE_ONION_ROUTER_PORT, BASE_USER_PORT, REGISTRY_PORT} from "../config";
import {rsaEncrypt, symEncrypt, exportSymKey, createRandomSymmetricKey, importSymKey} from '../crypto';
import axios from 'axios';
import { Node } from '../registry/registry';
import {error} from "console";

export type SendMessageBody = {
  message: string;
  destinationUserId: number;
};

export var lastReceivedEncryptedMessage : string | null = null;
export var lastReceivedDecryptedMessage : string | null = null;
export var lastMessageDestination : string | null = null;

export var lastSentEncryptedMessage : string | null = null;

export var lastSendDecryptedMessage : string | null = null;


export async function user(userId: number) {
    const _user = express();
    _user.use(express.json());
    _user.use(bodyParser.json());

    // TODO implement the status route
    _user.get("/status", (req, res) => {
        res.status(200).send("live");
    });


    _user.get("/getLastReceivedMessage", (req, res) => {
        res.status(200).json({result: lastReceivedDecryptedMessage})
    });

    _user.get("/getLastSentMessage", (req, res) => {
        res.status(200).json({result: lastSendDecryptedMessage})
    });

    _user.post("/message", (req, res) => {
        const {message} = req.body;
        // Update the value of lastReceivedMessage
        lastReceivedDecryptedMessage = message;
        res.status(200).send("success");
    });

    _user.post('/sendMessage', async (req, res) => {
        const { message, destinationUserId } = req.body;

        // Get all nodes with getNodeRegistry
        const response = await axios.get(`http://localhost:${REGISTRY_PORT}/getNodeRegistry`);
        const nodes = response.data.nodes as Node[];

        // Create a random circuit of 3 distinct nodes
        const circuit: any[] = [];
        while (circuit.length < 3) {
            const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
            if (!circuit.includes(randomNode)) {
                circuit.push(randomNode);
            }
        }

        // Initialize encryptedMessage with destinationUserId
        let destination = String(BASE_USER_PORT + destinationUserId).padStart(10, '0');
        let encryptedMessage=message;

        for (const node of circuit) {
            // Create a unique symmetric key for each node
            const symKeyCrypto = await createRandomSymmetricKey();

            // Export the symmetric key to a string
            const symKeyString = await exportSymKey(symKeyCrypto);

            // Import the symmetric key back to a CryptoKey
            const symKey = await importSymKey(symKeyString);

            // Encode the destination of each step

            // Concatenate and encrypt the message with the symmetric key
            const tempMessage = await symEncrypt(symKey, destination + encryptedMessage);

            destination = String(BASE_ONION_ROUTER_PORT + node.nodeId).padStart(10, '0');


            // Encrypt the symmetric key with the node's RSA public key
            const encryptedSymKey = await rsaEncrypt(symKeyString, node.pubKey);

            // Concatenate the encrypted symmetric key with the encrypted message
            encryptedMessage = encryptedSymKey + tempMessage;
        }

        // Send the final encrypted message to the entry node's HTTP POST `/message` route
        const entryNode = circuit[2];
        error("Message send to "+entryNode.nodeId)
        await axios.post(`http://localhost:${BASE_ONION_ROUTER_PORT + entryNode.nodeId}/message`, {
            message: encryptedMessage,
        });
        lastSendDecryptedMessage = message;
        res.status(200).send('Message sent');
    });

    const server = _user.listen(BASE_USER_PORT + userId, () => {
        console.log(
            `User ${userId} is listening on port ${BASE_USER_PORT + userId}`
        );
    });

    return server;

}