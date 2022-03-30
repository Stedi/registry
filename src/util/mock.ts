import _ from "lodash";
import { OpenAPIV3 } from "openapi-types";
import RandExp from "randexp";

export type SchemaLike = OpenAPIV3.SchemaObject;

function resolveAllOf(schema: SchemaLike): SchemaLike {
  if (schema && schema.allOf && schema.allOf[0]) {
    schema = _.reduce(
      schema.allOf as SchemaLike,
      (combined, subschema: SchemaLike) => _.merge({}, resolveAllOf(subschema)),
      schema
    );
  }
  return schema;
}

export function mock(schemalike: SchemaLike): any {
  // allOf, merge all subschemas
  let schema = resolveAllOf({ ...schemalike });

  if (!schema) {
    return schema;
  }

  if (schema.example) {
    return schema.example;
  }

  if (schema.default) {
    return schema.default;
  }

  // oneOf, use first
  if (schema.oneOf && schema.oneOf[0]) {
    return mock(schema.oneOf[0] as SchemaLike);
  }

  // anyOf, use first
  if (schema.anyOf && schema.anyOf[0]) {
    return mock(schema.anyOf[0] as SchemaLike);
  }

  // get type, use first if array
  const type = _.isArray(schema.type) ? _.first(schema.type) : schema.type;

  if (type === "object") {
    const obj = schema as OpenAPIV3.NonArraySchemaObject;
    const { properties } = obj;
    if (!properties) {
      return {};
    }
    const objProperties = _.mapValues(properties, mock);

    return objProperties;
  }

  if (type === "array") {
    const array = schema as OpenAPIV3.ArraySchemaObject;
    const items = array.items as SchemaLike;
    if (!items) {
      return [];
    }
    const examples = [];
    let example = ((items.oneOf && items.oneOf[0]) || items) as SchemaLike;
    if (items.anyOf) {
      // include one of each example for anyOf and allOf
      for (const option of items.anyOf) {
        example = option as SchemaLike;
        examples.push(mock(example));
      }
    }
    // if minItems is set make sure we have at least that many items
    const minItems = array.minItems || 1;
    while (examples.length < minItems) {
      examples.push(mock(example));
    }
    // limit to max items if applicable
    return array.maxItems ? _.take(examples, array.maxItems) : examples;
  }

  if (_.isArray(schema.enum)) {
    return schema.enum[0];
  }

  if (type === "string") {
    const { format } = schema;
    const val = format ? formatExamples[format] : formatExamples._default;

    if (schema.pattern) {
      const randexp = new RandExp(schema.pattern);
      randexp.max = schema.maxLength ?? 10;

      let val = randexp.gen();

      while (val.length < (schema.minLength ?? 0)) {
        val = randexp.gen();
      }

      return randexp.gen();
    }

    const minln = !_.isNil(schema.minLength) ? schema.minLength : 0;
    const maxln = !_.isNil(schema.maxLength) ? schema.maxLength : val.length;

    if (val === formatExamples._default && val.length < minln) {
      return _.padEnd(val, minln, val);
    }

    return val.substring(0, _.clamp(val.length, minln, maxln));
  }

  if (type === "number") {
    return 0;
  }

  if (type === "integer") {
    if (schema.format === "unix-time") {
      return 1647352387;
    }

    return 0;
  }

  if (type === "null") {
    return null;
  }

  if (type === "boolean") {
    return true;
  }

  // unknown type
  return {};
}

const formatExamples: { [format: string]: string } = {
  email: "user@example.com",
  hostname: "http://example.com",
  ipv4: "8.8.8.8",
  ipv6: "2001:4860:4860::8888",
  uri: "https://example.com/path",
  decimal: "0.0",
  "uri-reference": "/path#anchor",
  "uri-template": "/path/{param}",
  "json-pointer": "/foo/bar",
  "date-time": "1970-01-01T00:00:00.000Z",
  date: "1970-01-01",
  uuid: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "unix-time": "1647352387",
  "date-time-rfc-2822": "01 Jun 2016 14:31:46 -0700",
  string: "string",
  _default: "string",
};
