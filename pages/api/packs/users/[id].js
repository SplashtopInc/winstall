import fetchWinstallAPI from "../../../../utils/fetchWinstallAPI";

export default async function handler(req, res) {
  const { id } = req.query;
  const cache = req.query.cache !== 'false';

  const endpoint = cache ? 'users' : 'profile';

  const { response, error } = await fetchWinstallAPI(`/packs/${endpoint}/${id}`);

  if (error) {
    return res.status(500).json({ error });
  }

  return res.status(200).json(response);
}
