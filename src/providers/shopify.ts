import { getIntrospectionQuery } from "graphql";
import axios from "axios";
import {
  GraphQLIntrospectionSchema,
  GraphQLProvider,
  EntitySchema,
} from "../provider";
import { fromIntrospectionQuery } from "graphql-2-json-schema";
import { IntrospectionQuery } from "graphql";
import jsonSchemaRefParser from "@apidevtools/json-schema-ref-parser";

export class ShopifyProvider implements GraphQLProvider {
  isEnabled(): boolean {
    return !!(process.env.SHOPIFY_URL && process.env.SHOPIFY_ACCESS_TOKEN);
  }

  async getVersions(): Promise<string[]> {
    return ["2022-01"];
  }

  async unbundle(bundle: GraphQLIntrospectionSchema): Promise<EntitySchema[]> {
    const jsonSchema = fromIntrospectionQuery(
      bundle.value as IntrospectionQuery,
      {
        ignoreInternals: true,
        nullableArrayItems: true,
      }
    );

    // Introspection schema lacks QueryRoot definition - adding it manually so it won't crash on dereferencing
    jsonSchema.definitions!["QueryRoot"] = {
      type: "object",
      title: "root",
      description: "root",
    };

    const dereferencedSchemas = await jsonSchemaRefParser.dereference(
      jsonSchema,
      { dereference: { circular: "ignore" } }
    );

    if (!("definitions" in dereferencedSchemas))
      throw new Error("Expected definitions");

    return Object.entries(dereferencedSchemas.definitions ?? {})
      .filter(([key]) =>
        !bundle.entities ? true : bundle.entities.includes(key)
      )
      .map(([key, value]) => ({
        name: key,
        schema: value,
      }));
  }

  async getSchema(version: string): Promise<GraphQLIntrospectionSchema> {
    const { data } = await axios.post(
      `https://${process.env.SHOPIFY_URL}/admin/api/2022-01/graphql.json`,
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
      value: data.data,
      entities: ["ProductInput", "CustomerInput", "OrderInput"],
    };
  }
}
