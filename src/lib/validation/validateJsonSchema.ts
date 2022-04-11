import axios from "axios";
import { SchemaObject, Options as AjvOptions } from "ajv";
import AjvFormats from "ajv-formats";
import Ajv202012Schema from "ajv/dist/refs/json-schema-2020-12/schema.json";
import Ajv2020 from "ajv/dist/2020";

export function validateSchema(jsonSchema: string): SchemaObject {
  try {
    const schemaObject = JSON.parse(jsonSchema) as SchemaObject;
    const ajv = getAjvInstance();

    if (!isSchemaVersionSupported(schemaObject)) {
      throw new Error(
        `the "${schemaObject.$schema}" is not allowed. Use one of [${supportedSchemaVersions.join(",")}] instead`,
      );
    }

    /**
     * We are using both `validateSchema` and compile here because
     * even though the `validateSchema` returns true, the compilation might still fail.
     *
     * Compilation allows us to catch errors related to our custom-defined keywords and keywords that do not exist
     * The `validateSchema` will catch errors where the user specified the wrong `type` for a given property.
     *
     * The notion of `validateSchema` passing and `compile` failing is also present within the `ajv`.
     * https://github.com/ajv-validator/ajv/blob/df07f668131c6670e9ed624f60d6419a4da9a3c8/spec/ajv.spec.ts#L587
     */
    const isValid = ajv.validateSchema(schemaObject);
    if (!isValid) {
      throw ajv.errors;
    }

    ajv.compile(schemaObject);

    return schemaObject;
  } catch (e) {
    throw e;
  }
}

export function validateSchemasDefault(schemaObject: SchemaObject): void {
  if (!schemaObject.default) {
    return;
  }

  const ajv = getAjvInstance();
  const validate = ajv.compile(schemaObject);

  const isValid = validate(schemaObject.default);

  if (!isValid) {
    throw validate.errors;
  }
}

function isSchemaVersionSupported(schema: SchemaObject) {
  /**
   * By default, the `json-schema-2020-12` is applied
   */
  if (!schema.$schema) {
    return true;
  }

  return supportedSchemaVersions.includes(schema.$schema);
}

function getAjvInstance() {
  const instance = new Ajv2020({
    ...defaultInstanceOptions,
    defaultMeta: Ajv202012Schema,
  });
  AjvFormats(instance);
  instance.addFormat("unix-time", {
    type: "number",
    validate: (x: number) => x > 0,
  });

  instance.addFormat("decimal", {
    validate: (x: string) => {
      const regex = /^[-+]?[0-9]+\.[0-9]+$/;
      return regex.test(x);
    },
  });

  instance.addFormat("string", {
    validate: () => true,
  });
  instance.addKeyword("example");

  return instance;
}

const defaultInstanceOptions: AjvOptions = {
  allErrors: true,
  strict: true,
  strictTypes: true,
  validateFormats: true,
};

const supportedSchemaVersions = [Ajv202012Schema.$schema];
