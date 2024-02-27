import bodyParser from "body-parser";
import express from "express";
import {BASE_ONION_ROUTER_PORT, BASE_USER_PORT} from "../config";
import { rsaEncrypt, symEncrypt, exportSymKey, createRandomSymmetricKey } from '../crypto';
import axios from 'axios';
import { Node } from '../registry/registry';

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
    res.status(200).json({result : lastReceivedDecryptedMessage})
  });

  _user.get("/getLastSentMessage", (req, res) => {
    res.status(200).json({result : lastSendDecryptedMessage})
  });

  _user.post("/message", (req, res) => {
    const { message } = req.body;
    // Update the value of lastReceivedMessage
    lastReceivedDecryptedMessage = message;
    res.status(200).send("success");
  });


  const server = _user.listen(BASE_USER_PORT + userId, () => {
    console.log(
      `User ${userId} is listening on port ${BASE_USER_PORT + userId}`
    );
  });

  return server;
}
