import is from "@sindresorhus/is";
import { SchemaObject } from "ajv";
import traverse from "json-schema-traverse";
import {
  emptyASTNode,
  isArrayNode,
  isObjectNode,
  makeEmptyArrayNode,
  makeEmptyObjectNode,
  UnaryNodeTuple,
} from "./node";

export const JSONSchemaToAST = (schema: unknown): unknown => {
  const rootJSONataASTNode = getRootJSONataASTNodeForSchema(schema);

  /**
   * We use `currentJsonPtr` arg of the traverse callback as key for this pointers map
   * to add children AST nodes to the correct parents
   */
  const JSONataASTPointers: Record<string, unknown> = {
    "": rootJSONataASTNode,
  };

  traverse(
    schema as SchemaObject,
    { allKeys: false },
    (currentSchema, currentJsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex) => {
      const isAtSchemaRoot = parentJsonPtr === undefined;
      if (isAtSchemaRoot) {
        return;
      }

      /**
       * We don't support leaf-level enum types, they can be safely ignored since we don't have a way to represent them in the UI.
       */
      if (isLeafLevelEnumType(currentSchema)) {
        return;
      }

      const currentJSONataASTNode = getNodeForJSONSchema(currentSchema);
      const parentJSONataASTPointer = JSONataASTPointers[parentJsonPtr];
      if (!parentJSONataASTPointer) {
        throw new Error(`Failed to find a parent AST node ${parentJsonPtr}`);
      }

      if (isObjectNode(parentJSONataASTPointer)) {
        const nameNode = { type: "string", value: String(keyIndex), position: 0 };
        const valueNode = currentJSONataASTNode;
        const objectPropertyTuple: UnaryNodeTuple = [nameNode, valueNode];

        parentJSONataASTPointer.lhs.push(objectPropertyTuple);
        JSONataASTPointers[currentJsonPtr] = valueNode;
        return;
      }

      if (isArrayNode(parentJSONataASTPointer)) {
        parentJSONataASTPointer.expressions.push(currentJSONataASTNode);
        JSONataASTPointers[currentJsonPtr] = currentJSONataASTNode;
        return;
      }
    },
  );

  return rootJSONataASTNode;
};

const isLeafLevelEnumType = (currentSchema: any) => {
  return currentSchema.type === undefined && currentSchema.enum && currentSchema.enum.length > 0;
};

const getRootJSONataASTNodeForSchema = (schema: any) => {
  if (schema.type === "array") {
    return makeEmptyArrayNode();
  }

  return makeEmptyObjectNode();
};

const getNodeForJSONSchema = (schema: any): any => {
  /**
   * In some cases the type is defined as an array (e.g. ["string", "null"]).
   * Since we don't have a way to represent this in our UI, we need to default to using only the first type.
   */
  if (Array.isArray(schema.type)) {
    const firstTypeSchema = { ...schema, type: schema.type[0] };

    return getNodeForJSONSchema(firstTypeSchema);
  }

  if (Array.isArray(schema.anyOf) && schema.anyOf.length > 0) {
    return getNodeForJSONSchema(schema.anyOf[0]);
  }

  if (is.emptyObject(schema)) {
    return makeEmptyObjectNode();
  }

  if (schema.type === "object") {
    return makeEmptyObjectNode();
  }

  if (schema.type === "array" && schema.items) {
    if (!("type" in schema.items)) {
      return emptyASTNode;
    }

    const nonPrimitiveArrayTypes = ["object", "array"];

    const schemaItemsType = Array.isArray(schema.items.type) ? schema.items.type[0] : schema.items.type;
    const isArrayOfPrimitives = schemaItemsType !== undefined && !nonPrimitiveArrayTypes.includes(schemaItemsType);

    if (isArrayOfPrimitives) {
      return emptyASTNode;
    }

    return {
      type: "unary",
      value: "[",
      position: 0,
      expressions: [],
      consarray: false,
    };
  }

  if (schema.type === "string") {
    return {
      type: "string",
      value: "string",
      position: 0,
    };
  }

  if (schema.type === "number" || schema.type === "integer") {
    return {
      type: "number",
      value: 0,
      position: 0,
    };
  }

  if (schema.type === "boolean") {
    return {
      type: "value",
      value: true,
      position: 0,
    };
  }

  if (schema.type === "null") {
    return {
      type: "value",
      value: null,
      position: 0,
    };
  }

  if (schema.enum && schema.enum.length > 0) {
    return {
      type: "string",
      value: schema.enum[0],
      position: 0,
    };
  }

  /**
   * `type` is not defined, example:
   * ```
   *  "something": {
   *    "description": "A description"
   *  },
   * ```
   * We cannot make any concrete assumptions about its shape,
   * but we need to fallback to some default value.
   */
  if (!schema.type) {
    return {
      type: "string",
      value: "string",
      position: 0,
    };
  }

  throw new Error(`Failed to map JSONSchema node to JSONata node", ${{ type: schema.type }})`);
};
