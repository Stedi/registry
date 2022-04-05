import http from "axios";

export async function getRaw(
  orgName: string,
  repoName: string,
  ref: string,
  path: string
): Promise<unknown> {
  const response = await http.get(
    `https://raw.githubusercontent.com/${orgName}/${repoName}/${ref}/${path}`
  );
  return await response.data;
}
