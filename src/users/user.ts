import bodyParser from "body-parser";
import express from "express";
import { BASE_USER_PORT } from "../config";

export type SendMessageBody = {
  message: string;
  destinationUserId: number;
};

export var lastReceivedEncryptedMessage : string | null = null;
export var lastReceivedDecryptedMessage : string | null = null;
export var lastMessageDestination : string | null = null;


export async function user(userId: number) {
  const _user = express();
  _user.use(express.json());
  _user.use(bodyParser.json());

  // TODO implement the status route
  _user.get("/status", (req, res) => {
    res.status(200).send("live");
  });


  _user.get("/getLastReceivedMessage", (req, res) => {
    res.status(200).json({result : null})
  });

  _user.get("/getLastSentMessage", (req, res) => {
    res.status(200).json({result : null})
  });


  const server = _user.listen(BASE_USER_PORT + userId, () => {
    console.log(
      `User ${userId} is listening on port ${BASE_USER_PORT + userId}`
    );
  });

  return server;
}
