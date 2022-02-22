import { getIntrospectionQuery } from "graphql";
import axios from "axios";
import { GraphQLIntrospectionSchema, Provider } from "../provider";
import { OpenAPIV3 } from "openapi-types";

export class ShopifyProvider implements Provider {
  async getVersions(): Promise<string[]> {
    return ["2022-01"];
  }

  async getSchema(version: string): Promise<GraphQLIntrospectionSchema> {
    const schema = await axios.post(
      `${process.env.SHOPIFY_URL}/admin/api/2022-01/graphql.json`,
      getIntrospectionQuery(),
      {
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN as string,
          "Content-Type": "application/graphql",
        },
        timeout: 30000,
      }
    );

    return {
      versionName: version,
      type: "graphql",
      value: schema.data,
      entities: ["ProductInput", "CustomerInput", "OrderInput"],
    };
  }

  getSchemaWithoutCircularReferences(
    schema: OpenAPIV3.SchemaObject
  ): OpenAPIV3.SchemaObject {
    return schema;
  }
}
