import OpenAPIParser from "@readme/openapi-parser";
import _ from "lodash";
import { OpenAPIV3 } from "openapi-types";
import http from "axios";
import { OpenAPI3Schema, OpenAPIProvider, EntitySchema } from "../provider";
import openAPIParser from "@readme/openapi-parser";

export class RampProvider implements OpenAPIProvider {
  async getVersions(): Promise<string[]> {
    return ["v1"];
  }

  async unbundle(bundle: OpenAPI3Schema): Promise<EntitySchema[]> {
    const dereferenced = await openAPIParser.dereference(bundle.value as any);

    const hasComponents = "components" in dereferenced;
    if (!hasComponents) throw new Error("Expected components");

    return Object.entries(dereferenced.components?.schemas ?? {})
      .filter(([key]) => !bundle.entities || bundle.entities.includes(key))
      .map(([key, value]) => ({
        name: key,
        schema: value,
      }));
  }

  async getSchema(version: string): Promise<OpenAPI3Schema> {
    const url = "https://docs.ramp.com/openapi/v1/ramp-developer.json";

    const { data } = await http.get(url);
    return {
      type: "openapi-v3",
      versionName: version,
      value: await this.transform(data),
    };
  }

  async transform(definition: OpenAPIV3.Document): Promise<OpenAPIV3.Document> {
    const document = (await OpenAPIParser.dereference(definition as any, {
      dereference: { circular: "ignore" },
    })) as OpenAPIV3.Document;

    for (let modelName in (document as any).components.models) {
      delete (document as any).components.models[modelName]["x-examples"];
      delete (document as any).components.models[modelName]["x-tags"];
    }

    return {
      ...document,
      components: {
        ...document.components,
        schemas: (document as any).components.models,
      },
    };
  }
}
