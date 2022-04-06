import { APISchema, BaseProvider, EntitySchema } from "../provider";
import NetsuiteAPI from "netsuite-rest";

const nsApi = new NetsuiteAPI({
  consumer_key: process.env.NETSUITE_CONSUMER_KEY,
  consumer_secret_key: process.env.NETSUITE_CONSUMER_SECRET_KEY,
  token: process.env.NETSUITE_TOKEN,
  token_secret: process.env.NETSUITE_TOKEN_SECRET,
  realm: process.env.NETSUITE_REALM,
  base_url: process.env.NETSUITE_BASE_URL,
});

export class NetsuiteProvider implements BaseProvider {
  name: string = "Netsuite";
  description: string =
    "NetSuite provides a suite of cloud-based financials / Enterprise Resource Planning (ERP), HR and omnichannel commerce software";
  logoUrl: string = "https://logo.clearbit.com/netsuite.com";
  customPath?: string | undefined;

  isEnabled(): boolean {
    return !!(
      process.env.NETSUITE_CONSUMER_KEY &&
      process.env.NETSUITE_CONSUMER_SECRET_KEY &&
      process.env.NETSUITE_TOKEN &&
      process.env.NETSUITE_TOKEN_SECRET &&
      process.env.NETSUITE_REALM &&
      process.env.NETSUITE_BASE_URL
    );
  }

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

  async unbundle({ entities, versionName }: { entities: string[]; versionName: string }): Promise<EntitySchema[]> {
    const schemas: EntitySchema[] = [];

    for (let index in entities) {
      const entityName = entities[index];
      const schemaRequestResponse = await nsApi.request({
        path: `record/${versionName}/metadata-catalog/${entityName}`,
        heads: {
          Accept: "application/schema+json",
        },
      });
      const cleanSchema = sanitizeSchema(schemaRequestResponse.data, entityName);

      schemas.push({
        name: entityName,
        schema: cleanSchema,
      });
    }

    return schemas;
  }
}

function sanitizeSchema(schema: unknown, entityName: string) {
  return JSON.parse(
    JSON.stringify(schema, (key, value) => {
      if (value?.nullable) {
        delete value.nullable;
      }

      const isKeyUnsupported = key === "x-ns-filterable" || key == "x-ns-custom-field";

      if (isKeyUnsupported) {
        return undefined;
      }

      const isNsLink = key === "items" && value["$ref"] === "/services/rest/record/v1/metadata-catalog/nsLink";

      if (isNsLink) {
        return nsLinkSchema;
      }

      // Drop all other references
      if (key === "$ref") {
        return undefined;
      }

      // Bug in their schema, "type": "object" is
      if (key === "quantity" && entityName === "inventoryitem") {
        return {
          type: "object",
          ...value,
        };
      }

      return value;
    }),
  );
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
