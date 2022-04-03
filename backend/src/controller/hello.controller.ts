import { Request, Response } from "express"

async function get(req: Request, res: Response) {
  res.send("Hello World!")
}

export default {
  get,
}