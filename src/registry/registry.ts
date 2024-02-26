import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { REGISTRY_PORT } from "../config";

export type Node = { nodeId: number; pubKey: string };

export type RegisterNodeBody = {
  nodeId: number;
  pubKey: string;
};

export type GetNodeRegistryBody = {
  nodes: Node[];
};

export async function launchRegistry() {
  const _registry = express();
  _registry.use(express.json());
  _registry.use(bodyParser.json());

  // TODO implement the status route
  _registry.get("/status", (req, res) => {
    res.status(200).send("live");
  });

    const nodes: Node[] = [];

    _registry.get("/getNodeRegistry", (req: Request, res: Response) => {
        res.status(200).json({nodes});
    });

    _registry.post("/registerNode", (req: Request, res: Response) => {
        const body = req.body as RegisterNodeBody;
        nodes.push({nodeId: body.nodeId, pubKey: body.pubKey});
        res.status(200).json({result: "Node registered"});
    });

  const server = _registry.listen(REGISTRY_PORT, () => {
    console.log(`registry is listening on port ${REGISTRY_PORT}`);
  });

  return server;
}
