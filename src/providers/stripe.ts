import { OpenAPI3Schema } from "../provider";
import * as github from "../github";
import { OpenAPIV3 } from "openapi-types";
import _ from "lodash";
import deepcopy from "deepcopy";
import { OpenAPIProvider } from "./openapi";

const maxDepth = 3;

export class StripeProvider extends OpenAPIProvider {
  constructor() {
    super({
      versions: ["v112"],
      baseUrl: "unused",
      entities: [
        "account",
        "address",
        "application",
        "balance",
        "card",
        "charge",
        "coupon",
        "customer",
        "checkout.session",
        "dispute",
        "discount",
        "event",
        "error",
        "file",
        "invoice",
        "invoiceitem",
        "item",
        "line_item",
        "order",
        "order_item",
        "payment_link",
        "payment_method",
        "payout",
        "person",
        "plan",
        "price",
        "quote",
        "recipient",
        "refund",
        "setup_attempt",
        "sku",
        "shipping",
        "source",
        "subscription",
        "subscription_item",
        "topup",
        "transfer",
      ],
      sanitizeSchema: (value) =>
        traverse(deepcopy(value) as OpenAPIV3.SchemaObject, new Set<String>()),
    });
  }

  override async getSchema(version: string): Promise<OpenAPI3Schema> {
    const definition = await github.getRaw(
      "stripe",
      "openapi",
      version,
      "openapi/spec3.json"
    );

    return {
      type: "openapi-v3",
      versionName: version,
      value: definition,
      // Arbitrarily taken subset of entities from https://stripe.com/docs/api/
      entities: this.entities,
    };
  }
}

function traverse(schema: OpenAPIV3.SchemaObject, parents: Set<String>): any {
  // delete stripe specific attributes
  delete (schema as any)["x-expansionResources"];
  delete (schema as any)["x-expandableFields"];
  delete (schema as any)["x-stripeBypassValidation"];
  delete (schema as any)["x-resourceId"];

  // oneOf, use first
  if (schema.oneOf && schema.oneOf[0]) {
    schema.oneOf = schema.oneOf.slice(0, 1);
    return traverse(schema.oneOf[0] as OpenAPIV3.SchemaObject, parents);
  }

  if (schema.anyOf && schema.anyOf[0]) {
    const { anyOf, nullable, ...rest } = schema;

    return {
      ...rest,
      ...(traverse(schema.anyOf[0] as OpenAPIV3.SchemaObject, parents) ?? {}),
    };
  }

  if (!_.isArray(schema.type) && schema.nullable) {
    (schema as any)["type"] = [schema.type, "null"];
    delete (schema as any)["nullable"];
    if (_.isArray(schema.enum)) {
      schema.enum.push(null);
    }
  }

  // get type, use first if array
  const type = _.isArray(schema.type) ? _.first(schema.type) : schema.type;

  if (type === "object") {
    const isTraveralDepthExceeded =
      (schema.title != undefined && parents.has(schema.title)) ||
      parents.size > maxDepth;

    if (isTraveralDepthExceeded) {
      return { type };
    }

    const obj = schema as OpenAPIV3.NonArraySchemaObject;
    const { properties } = obj;
    if (!properties) {
      return {};
    }
    (schema as any)["properties"] = _.mapValues(properties, (property) => {
      let cloneParents = deepcopy(parents);
      cloneParents.add(schema.title as string);
      return traverse(property as any, cloneParents);
    });
    return schema;
  }

  if (type === "array") {
    const array = schema as OpenAPIV3.ArraySchemaObject;
    const items = array.items as OpenAPIV3.SchemaObject;
    if (!items) {
      return [];
    }
    (schema as OpenAPIV3.ArraySchemaObject).items = traverse(items, parents);
    return schema;
  }
  return schema;
}
