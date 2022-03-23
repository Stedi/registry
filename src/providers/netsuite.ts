import axios from "axios";
import { Provider, Schema } from "../provider";

export class NetsuiteProvider {
  async getSchema(version: string): Promise<any> {
    return {
      versionName: version,
      type: "netsuite",
      value: data.data,
      entities: ["", "", ""],
    };
  }

  async unbundle(): Promise<Schema[]> {
    return [];
  }
}
