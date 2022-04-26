import { EntitySchema, OpenAPI3Schema } from "../provider";
import { OpenAPIProvider } from "./openapi";
import openAPIParser from "@readme/openapi-parser";
import axios from "axios";

export class SquareProvider extends OpenAPIProvider {
  constructor() {
    super({
      baseUrl: "https://raw.githubusercontent.com/square/connect-api-specification/master/api.json",
      description:
        "Square is a merchant services aggregator and mobile payment company that aims to simplify commerce through technology.",
      docsLink: "https://developer.squareup.com/docs",
      entities: ["Order", "Payment", "Customer", "Subscription", "Checkout"],
      logoUrl: "https://logo.clearbit.com/squareup.com",
      name: "Square",
      sanitizeSchema,
      versions: ["2.0"],
    });
  }

  override async getSchema(version: string): Promise<OpenAPI3Schema> {
    const definition = await axios.get(this.baseUrl!);

    return {
      type: "openapi-v3",
      versionName: version,
      value: definition.data,
      entities: this.entities,
    };
  }

  override async unbundle(bundle: OpenAPI3Schema): Promise<EntitySchema[]> {
    const parsedBundle = bundle.value;
    addMissingDefinitionPointers(parsedBundle);
    const dereferenced = await openAPIParser.dereference(parsedBundle);

    const components =
      (dereferenced as any).definitions ??
      (dereferenced as any).components?.models ??
      (dereferenced as any).components?.schemas;

    if (!components) throw new Error("Expected components or models");

    return Object.entries(components ?? {})
      .filter(([key]) => !bundle.entities || bundle.entities.includes(key))
      .map(([key, value]) => ({
        name: key,
        schema: sanitizeSchema(value),
      }));
  }
}

/**
 * Square's OpenAPI definition contains a lot of missing definition pointers.
 * Here we add them manually to make dereferencing possible.
 */
function addMissingDefinitionPointers(parsedBundle: any) {
  parsedBundle.definitions.Status = {
    type: "string",
  };
  parsedBundle.definitions.invoice_delivery_methodInvoiceDeliveryMethod = {
    type: "string",
  };
  parsedBundle.definitions.ExternalSquareProduct = {
    type: "string",
  };
  parsedBundle.definitions.Type = {
    type: "string",
  };
  parsedBundle.definitions.GANSource = {
    type: "string",
  };
  parsedBundle.definitions.Reason = {
    type: "string",
  };
  parsedBundle.definitions.Info = {
    type: "string",
  };
  parsedBundle.definitions.Sort = {
    type: "string",
  };
  parsedBundle.definitions.Filter = {
    type: "string",
  };
  parsedBundle.definitions.InfoCode = {
    type: "string",
  };
  parsedBundle.definitions.Field = {
    type: "string",
  };
  parsedBundle.definitions.squareuppaymentbalancesActivityType = {
    type: "string",
  };
}

function sanitizeSchema(schema: unknown) {
  return JSON.parse(
    JSON.stringify(schema, (key, value) => {
      if (value?.["x-read-only"]) {
        delete value["x-read-only"];
      }

      if (value?.["x-is-beta"]) {
        delete value["x-is-beta"];
      }

      if (value?.["x-is-deprecated"]) {
        delete value["x-is-deprecated"];
      }

      if (value?.["x-release-status"]) {
        delete value["x-release-status"];
      }

      if (
        value.format === "phone-number" ||
        value.format === "currency" ||
        value.format === "number,string" ||
        value.format === "http-method"
      ) {
        delete value.format;
      }

      /**
       * Payment.risk_evaluation.required contains "status" which is not listed as a property
       */
      if (key === "risk_evaluation") {
        delete value.required;
      }

      return value;
    }),
  );
}
