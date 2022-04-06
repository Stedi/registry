import http, { AxiosResponse } from "axios";

interface Tag {
  name: string;
}

function links(response: AxiosResponse<any, any>): Record<string, string | undefined> {
  const linkString = response.headers.link;
  const parts = linkString.split(",");
  return Object.fromEntries(
    parts.map((part) => {
      const [linkPart, relPart] = part.split(";");
      const link = linkPart.replace("<", "").replace(">", "");
      const rel = JSON.parse(relPart.split("=")[1].trim());
      return [rel, link];
    }),
  );
}

export async function* getTags(orgName: string, repoName: string): AsyncGenerator<Tag> {
  let nextUrl: string | undefined = `https://api.github.com/repos/${orgName}/${repoName}/tags`;
  do {
    const response: AxiosResponse<Tag[]> = await http.get(nextUrl);
    for (const tag of response.data) {
      yield tag;
    }
    nextUrl = links(response)["next"];
  } while (!!nextUrl);
}

export async function getRaw(orgName: string, repoName: string, ref: string, path: string): Promise<unknown> {
  const response = await http.get(`https://raw.githubusercontent.com/${orgName}/${repoName}/${ref}/${path}`);
  return await response.data;
}
