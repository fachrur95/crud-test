import { getServerAuthSession } from '@/server/auth';
import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next'
import { env } from "@/env";

const GLOBAL_URL = `${env.BACKEND_URL}/api/v1/division`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerAuthSession({ req, res });
  if (!session) return res.status(401);

  const id = req.query.id;

  if (req.method === "DELETE") {
    if (!id) return res.status(404).json({ message: "ID Not found!" });
    const config = {
      url: `${GLOBAL_URL}/${id as string}`,
      method: "DELETE",
      headers: { Authorization: `Bearer ${session.accessToken}` },
    }
    return await axios<{ message: string }>(config)
      .then((result) => {
        const response = result.data;
        res.status(200).json(response);
      })
      .catch((err: { response: { data: { message: string } } }) => {
        const response = err.response.data;
        res.status(500).json(response);
      });
  }
  return res.status(404).json({ message: "Not found!" });
}