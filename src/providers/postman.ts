import { OpenAPI3Schema } from "../provider";
import yaml from "js-yaml";
import postmanToOpenApi from "postman-to-openapi";
import _ from "lodash";
import axios from "axios";
import { OpenAPIProvider, OpenAPIProviderProps } from "./openapi";

export interface PostmanProviderProps extends OpenAPIProviderProps {
  postmanCollectionId?: string;
}

export class PostmanProvider extends OpenAPIProvider {
  public readonly postmanCollectionId?: string;

  private readonly postmanApiKey = process.env.POSTMAN_API_KEY;

  constructor({ postmanCollectionId, ...rest }: PostmanProviderProps) {
    super(rest);
    this.postmanCollectionId = postmanCollectionId;
  }

  override isEnabled(): boolean {
    return !!this.postmanCollectionId;
  }

  async getSchema(version: string): Promise<OpenAPI3Schema> {
    if (!this.postmanCollectionId) {
      throw new Error('Neither "postmanCollectionId" wasn\'t provided, nor method "getSchema" was overriden');
    }

    const url = `https://api.getpostman.com/collections/${this.postmanCollectionId}`;
    const collection = await axios.get(url, {
      headers: {
        "x-api-key": this.postmanApiKey as string,
      },
    });

    const yamlOpenApiSchema: string = await postmanToOpenApi(JSON.stringify(collection.data));
    const jsonOpenApiSchema: unknown = yaml.load(yamlOpenApiSchema);

    return {
      type: "openapi-v3",
      versionName: version,
      value: jsonOpenApiSchema,
      entities: this.entities,
    };
  }
}
