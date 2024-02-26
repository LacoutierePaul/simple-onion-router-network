import bodyParser from "body-parser";
import express from "express";
import { BASE_ONION_ROUTER_PORT } from "../config";
import { lastReceivedEncryptedMessage, lastReceivedDecryptedMessage, lastMessageDestination } from "./../users/user";



export async function simpleOnionRouter(nodeId: number) {
  const onionRouter = express();
  onionRouter.use(express.json());
  onionRouter.use(bodyParser.json());


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

  return server;
}
