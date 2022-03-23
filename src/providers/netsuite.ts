import { APISchema, EntitySchema } from "../provider";
import NetsuiteAPI from "netsuite-rest";

const nsApi = new NetsuiteAPI({
  realm: "TSTDRV1982068",
  base_url: "https://tstdrv1982068.suitetalk.api.netsuite.com",
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

      schemas.push({
        name: entity,
        schema,
      });
    }

    return schemas;
  }
}
