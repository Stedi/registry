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
      const entity = entities[index];
      const schemaRequest = await nsApi.request({
        path: `record/${versionName}/metadata-catalog/${entity}`,
        heads: {
          Accept: "application/schema+json",
        },
      });
      const schema = schemaRequest.data;
      const cleanSchema = JSON.parse(
        JSON.stringify(schema, (k, v) =>
          k === "x-ns-filterable" ? undefined : v
        )
      );

      schemas.push({
        name: entity,
        schema: cleanSchema,
      });
    }

    return schemas;
  }
}
