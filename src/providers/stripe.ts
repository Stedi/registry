import { OpenAPI3Schema, Provider } from "../provider";
import * as github from "../github";
import { OpenAPIV3 } from "openapi-types";
import _ from "lodash";

export class StripeProvider implements Provider {
  async getVersions(): Promise<string[]> {
    const tags: string[] = [];
    for await (const tag of github.getTags("stripe", "openapi")) {
      tags.push(tag.name);
    }
    return [...tags];
  }

  async getSchema(version: string): Promise<OpenAPI3Schema> {
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
    };
  }

  getSchemaWithoutCircularReferences(schema: OpenAPIV3.SchemaObject): OpenAPIV3.SchemaObject {
    return traverse(schema, new Set<string>());
  };
}

function traverse(schema: OpenAPIV3.SchemaObject, parents: Set<String>): any {

  // delete (schema as any)["x-expansionResources"];

  // use default
  if (schema.default !== undefined) {
    return schema.default;
  }
  // oneOf, use first
  if (schema.oneOf && schema.oneOf[0]) {

    schema.oneOf = schema.oneOf.slice(0, 1);
    return traverse(schema.oneOf[0] as OpenAPIV3.SchemaObject, parents);

  }
  if (schema.anyOf && schema.anyOf[0]) {
    schema.anyOf = schema.anyOf.slice(0, 1);
    return traverse(schema.anyOf[0] as OpenAPIV3.SchemaObject, parents);
    /*schema.anyOf = schema.anyOf.filter((element: any) => {
      return element.title === undefined || !parents.has(element.title);
    });
    schema.anyOf = _.map(schema.anyOf as SchemaLike, (element: any) => {
      return traverse(element, parents);
    });
    return schema;*/
  }

  // get type, use first if array
  const type = _.isArray(schema.type) ? _.first(schema.type) : schema.type;

  if (type === 'object') {
    if ((schema.title != undefined && parents.has(schema.title)) || parents.size > 6) {
      return {};
    }
    const obj = schema as OpenAPIV3.NonArraySchemaObject;
    const { properties } = obj;
    if (!properties) {
      return {};
    }
    (schema as any)["properties"] = _.mapValues(properties, (property) => {
      let cloneParents = new Set(parents);
      cloneParents.add(schema.title as string);
      return traverse(property as any, cloneParents);
    });
    return schema;
  }

  if (type === 'array') {
    const array = schema as OpenAPIV3.ArraySchemaObject;
    const items = array.items as OpenAPIV3.SchemaObject;
    if (!items) {
      return [];
    }
    return traverse(items, parents);
  }
  return schema;
}
