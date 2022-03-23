import { APISchema, EntitySchema } from "../provider";
import NetsuiteAPI from "netsuite-rest";

const nsApi = new NetsuiteAPI({
  consumer_key: process.env.NETSUITE_CONSUMER_KEY,
  consumer_secret_key: process.env.NETSUITE_CONSUMER_SECRET_KEY,
  token: process.env.NETSUITE_TOKEN,
  token_secret: process.env.NETSUITE_TOKEN_SECRET,
  realm: process.env.NETSUITE_REALM,
  base_url: process.env.NETSUITE_BASE_URL,
});

export class NetsuiteProvider {
  async getVersions(): Promise<string[]> {
    return ["v1"];
  }

  async getSchema(version: string): Promise<APISchema> {
    return {
      type: "netsuite",
      versionName: version,
      value: null, // Doesn't matter - we get entities one by one in unbundle step
      entities: [
        "customer",
        "employee",
        "invoice",
        "inventoryitem",
        "purchaseorder",
        "salesorder",
        "pricebook",
        "contactrole",
        "billingaccount",
        "charge",
        "task",
        "subsidiary",
        "subscription",
        "usage",
        "cashsale",
        "itemfulfillment",
      ],
    };
  }

  async unbundle({
    entities,
    versionName,
  }: {
    entities: string[];
    versionName: string;
  }): Promise<EntitySchema[]> {
    const schemas: EntitySchema[] = [];

    for (let index in entities) {
      const entityName = entities[index];
      const schemaRequest = await nsApi.request({
        path: `record/${versionName}/metadata-catalog/${entityName}`,
        heads: {
          Accept: "application/schema+json",
        },
      });
      const schema = schemaRequest.data;

      const cleanSchema = JSON.parse(
        JSON.stringify(schema, (key, value) => {
          // Unsupported in JSONSchema's strict mode
          if (key === "x-ns-filterable" || key == "x-ns-custom-field") {
            return undefined;
          }

          // Denormalize nsLinks
          if (
            key === "items" &&
            value["$ref"] === "/services/rest/record/v1/metadata-catalog/nsLink"
          ) {
            return nsLinkSchema;
          }

          // Drop all other references
          if (key === "$ref") {
            return undefined;
          }

          // Bug in Netsuite's schema, "type": "object" is missing
          if (key === "quantity" && entityName === "inventoryitem") {
            return {
              type: "object",
              ...value,
            };
          }

          return value;
        })
      );

      schemas.push({
        name: entityName,
        schema: cleanSchema,
      });
    }

    return schemas;
  }
}

const nsLinkSchema = {
  type: "object",
  properties: {
    rel: {
      title: "Relationship",
      type: "string",
      readOnly: true,
    },
    href: {
      title: "Hypertext Reference",
      type: "string",
      readOnly: true,
    },
  },
};
