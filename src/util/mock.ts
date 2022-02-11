import { randDomainName, randEmail, randIp, randIpv6, randNumber, randSentence, randSoonDate, randUrl, randUuid, randWord } from '@ngneat/falso';
import _ from 'lodash';
import { OpenAPIV3 } from 'openapi-types';

export type SchemaLike = OpenAPIV3.SchemaObject;

function resolveAllOf(schema: SchemaLike): SchemaLike {

  if (schema.allOf && schema.allOf[0]) {
    schema = _.reduce(schema.allOf as SchemaLike, (combined, subschema: SchemaLike) => _.merge({}, resolveAllOf(subschema)), schema);
  }
  return schema;
}

export function mock(schema: SchemaLike): any {
  // allOf, merge all subschemas
  schema = resolveAllOf(schema);

  if (schema.example !== undefined) {
    return schema.example;
  }

  // use default
  if (schema.default !== undefined) {
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

  if (type === 'object') {
    const obj = schema as OpenAPIV3.NonArraySchemaObject;
    const { properties } = obj;
    if (!properties) {
      return {};
    }
    return _.mapValues(properties, mock);
  }

  if (type === 'array') {
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

  if (type === 'string') {
    const { format } = schema;
    const formatExamples: { [format: string]: string } = {
      email: randEmail(),
      hostname: randDomainName(),
      ipv4: randIp(),
      ipv6: randIpv6(),
      uri: randUrl(),
      'uri-reference': '/path#anchor',
      'uri-template': '/path/{param}',
      'json-pointer': '/foo/bar',
      'date-time': randSoonDate().toJSON(),
      'date': randSoonDate().toJSON(),
      uuid: randUuid(),
      _default: randWord(),
    };
    const val = format ? formatExamples[format] : formatExamples._default;
    const minln = !_.isNil(schema.minLength) ? schema.minLength : 0;
    const maxln = !_.isNil(schema.maxLength) ? schema.maxLength : val.length;
    if (val === formatExamples._default && val.length < minln) {
      return _.padEnd(val, minln, val);
    }
    return val.substr(0, _.clamp(val.length, minln, maxln));
  }

  if (type === 'number') {
    return randNumber();
  }

  if (type === 'integer') {
    return Math.floor(randNumber());
  }

  if (type === 'null') {
    return null;
  }

  if (type === 'boolean') {
    return true;
  }

  // unknown type
  return {};
}
