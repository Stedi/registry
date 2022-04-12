import {
  ArrayUnaryNode,
  ConditionNode,
  FunctionNode,
  LiteralNode,
  NameNode,
  ObjectUnaryNode,
  PathNode,
  StringNode,
  VariableNode,
} from "@stedi/prettier-plugin-jsonata/dist/types";

export type UnaryNodeTuple = [any, any];

/**
 * Checks whether the node represents AST that evaluates to an object.
 * For example, `{"foo": "bar"}` expression would evaluate to AST that fulfills checks within this function.
 *
 * The `isObjectNode` only checks the underlying structure, and the number of properties or types of values is of no concern for this function.
 */
export const isObjectNode = (node: any): node is ObjectUnaryNode => {
  if (node.type !== "unary") {
    return false;
  }

  if (node.value !== "{") {
    return false;
  }

  return true;
};

type EmptyObjectNode = Omit<ObjectUnaryNode, "lhs"> & { lhs: [] };
/**
 * A generator function, which is producing unique empty object instances on every call.
 *
 * We are using this function instead of a constant, to make sure we get a new instance every time,
 * otherwise the tree can get all messed up due to the same object instance used on multiple levels.
 */
export const makeEmptyObjectNode = (): EmptyObjectNode => {
  return {
    type: "unary",
    position: 0,
    value: "{",
    lhs: [],
  };
};

export const makeEmptyMappingNode = makeEmptyObjectNode;

/**
 * Checks whether the node represents AST that evaluates to an empty object.
 * For example, `{}` expression would evaluate to AST that fulfills checks within this function.
 */
export const isEmptyObjectNode = (node: any): node is EmptyObjectNode => {
  if (node.type !== "unary") {
    return false;
  }

  if (node.value !== "{") {
    return false;
  }

  return node.lhs.length === 0;
};

export const isEmptyMappingNode = isEmptyObjectNode;

export type KeyObjectTuple = [NameNode, ObjectUnaryNode];

/**
 * Checks whether the node represents AST that evaluates to key: object structure.
 * For example, `"key": {"a": 1}` expression would evaluate to AST that fulfills checks within this function.
 */
export const isKeyObjectTuple = (tuple: [any, any]): tuple is [NameNode, ObjectUnaryNode] => {
  const [nameNode, propertiesNode] = tuple;
  if (nameNode.type !== "string") {
    return false;
  }

  return isObjectNode(propertiesNode);
};

type EmptyArrayNode = Omit<ArrayUnaryNode, "expressions"> & { expressions: [] };

export const makeEmptyArrayNode = (): EmptyArrayNode => {
  return {
    type: "unary",
    position: 0,
    value: "[",
    expressions: [],
    consarray: false,
  };
};

export type RootArrayTuple = [EmptyNode, ArrayUnaryNode];

export const isRootArrayOfObjectsTuple = (tuple: [any, any]): tuple is RootArrayTuple => {
  if (!isEmptyNode(tuple[0])) {
    return false;
  }

  if (!isArrayOfObjectsNode(tuple[1])) {
    return false;
  }

  return true;
};

export type ArrayOfObjectsNode = Omit<ArrayUnaryNode, "expressions"> & { expressions: ObjectUnaryNode[] };
/**
 * Checks whether the node represents and AST that evaluates an array.
 * For example, `[{property: "value"}, {property: "otherValue"}]`, `[1, true, "string"]`, and `[]` expressions would evaluate to AST that fulfills checks within this function.
 */
export const isArrayNode = (node: any): node is ArrayUnaryNode => {
  if (node.type !== "unary") {
    return false;
  }

  if (node.value !== "[") {
    return false;
  }

  return true;
};

/**
 * Checks whether the node represents and AST that evaluates an non-empty array containing objects.
 * For example, `[{property: "value"}, {property: "otherValue"}]` expression would evaluate to AST that fulfills checks within this function.
 *
 * The `isArrayOfObjectsNode` will only return true only if ALL the array items are objects.
 */
export const isArrayOfObjectsNode = (node: any): node is ArrayOfObjectsNode => {
  if (!isArrayNode(node)) {
    return false;
  }

  const arrayItemsNodes = node.expressions;
  if (arrayItemsNodes.length === 0) {
    return false;
  }

  const foundNonObjectItems = arrayItemsNodes.some((arrayItemNode) => !isObjectNode(arrayItemNode));
  return !foundNonObjectItems;
};

export type ArrayOfPrimitivesNode = Omit<ArrayUnaryNode, "expressions"> & { expressions: LiteralNode[] };

/**
 * Checks whether the node represents and AST that evaluates an non-empty array containing primitives (numbers, strings, booleans).
 * For example, `[1, true, "string"]` expression would evaluate to AST that fulfills checks within this function.
 *
 * The `isArrayOfPrimitivesNode` will only return true only if ALL the array items are primitives.
 */
export const isArrayOfPrimitivesNode = (node: any): node is ArrayOfPrimitivesNode => {
  if (!isArrayNode(node)) {
    return false;
  }

  const arrayItemsNodes = node.expressions;
  if (arrayItemsNodes.length === 0) {
    return false;
  }

  const foundNonPrimitiveItems = arrayItemsNodes.some((arrayItemNode) => !isPrimitiveNode(arrayItemNode));
  return !foundNonPrimitiveItems;
};

export type NormalizedArrayOfObjectsNode = Omit<ArrayUnaryNode, "expressions"> & { expressions: [ObjectUnaryNode] };

/**
 * Checks whether the node represents and AST that evaluates to a single-item array. That item has to be an object.
 * For example, the `[{property: "value"}]` expression would evaluate to AST that fulfills checks within this function.
 *
 * We assume that all items within an array of objects obey by the same "interface" meaning the properties on each object are the same.
 */
export const isNormalizedArrayOfObjectsNode = (node: any): node is NormalizedArrayOfObjectsNode => {
  if (!isArrayOfObjectsNode(node)) {
    return false;
  }

  const arrayItemsNodes = node.expressions;
  const hasOnlyOneItemNode = arrayItemsNodes.length === 1;

  return hasOnlyOneItemNode;
};

export type RootMapOperationNode = [EmptyNode, MapOperationNode];

export const isRootMapOperationTuple = (tuple: [any, any]): tuple is RootMapOperationNode => {
  if (!isEmptyNode(tuple[0])) {
    return false;
  }

  if (!isMapOperationNode(tuple[1])) {
    return false;
  }

  return true;
};

export type MapOperationContextNodes =
  /**
   * foo.bar.baz
   */
  | [NameNode, ...NameNode[]]
  /**
   * Manually entered array, e.g. [1,2,3]
   */
  | [ArrayUnaryNode, ...NameNode[]]
  /**
   * undefined
   */
  | [EmptyNode]
  /**
   * $$.foo.bar.baz
   * OR
   * $.foo.bar.baz
   *
   * The amount of `$` symbols depends on the value of the `VariableNode`.
   */
  | [VariableNode, ...NameNode[]];

export type MapOperationContextNode =
  | Omit<PathNode, "steps"> & {
      steps: MapOperationContextNodes;
    };

export type MapOperationNode = Omit<PathNode, "steps"> & {
  steps: [...MapOperationContextNodes, ObjectUnaryNode];
};
/**
 * Checks whether the node represents an AST that evaluates to a jsonata `map` operation.
 * For example, the `foo.bar.baz.{"property": "value"}` expression would evaluate to AST that fulfills checks within this function.
 *
 * The `map` operation consists of two parts.
 * The first part is the `map operation context`. In the example above, AST representing `foo.bar.baz` is the `map operation context`.
 * The second part is the `map operation body`. In the example above, AST representing `{"property": "value"}` is the `map operation body`.
 */
export const isMapOperationNode = (node: any): node is MapOperationNode => {
  if (node.type !== "path") {
    return false;
  }

  /**
   * The `map operation context` might be represented with multiple `steps`.
   * There has to be at lest one node for the `map operation context` and only one for the `map operation body`.
   */
  if (node.steps.length < 2) {
    return false;
  }

  const mapOperationBodyNode = node.steps[node.steps.length - 1];
  return isObjectNode(mapOperationBodyNode);
};

/**
 * Checks whether the node represents an AST that evaluates to a static string value.
 * For example, the `"hello"` expression would evaluate to AST that fulfills checks within this function.
 */
export const isStaticStringNode = (node: any): node is StringNode => {
  return node.type === "string";
};

export type ExplicitContextReferenceNode = Omit<VariableNode, "value"> & { value: "" };
/**
 * Checks whether the node represents an AST that evaluates to a "explicit context reference" node.
 * For example, the `$` would evaluate to AST that fulfills checks within this function.
 *
 * Docs regarding `$` symbol https://docs.jsonata.org/1.7.0/programming#built-in-variables
 */
export const isExplicitContextReferenceNode = (node: any): node is ExplicitContextReferenceNode => {
  if (node.type !== "variable") {
    return false;
  }

  if (node.value !== "") {
    return false;
  }

  return true;
};

export type ExplicitRootReferenceNode = Omit<VariableNode, "value"> & { value: "$" };
/**
 * Checks whether the node represents an AST that evaluates to a "explicit root reference" node.
 * For example, the `$$` would evaluate to AST that fulfills checks within this function.
 *
 * Docs regarding `$$` symbol https://docs.jsonata.org/1.7.0/programming#built-in-variables
 */
export const isExplicitRootReferenceNode = (node: any): node is ExplicitContextReferenceNode => {
  if (node.type !== "variable") {
    return false;
  }

  if (node.value !== "$") {
    return false;
  }

  return true;
};

export type PathLookupNode = PathNode;

/**
 * Checks whether the node represents an AST that evaluates to a non-empty JSONata path expression.
 * For example, the `"foo.bar".baz` expression would evaluate to AST that fulfills checks within this function.
 */
export const isPathLookupNode = (node: any): node is PathLookupNode => {
  if (node.type !== "path") {
    return false;
  }

  if (node.steps.length === 0) {
    return false;
  }

  return true;
};

/**
 * Checks whether the node represents an AST that evaluates to a primitive node.
 * For example, the `true`, `"hello"` or `1` would all evaluate to AST that fullfil checks within this function.
 */
export const isPrimitiveNode = (node: any): node is LiteralNode => {
  return ["string", "number", "value"].includes(node.type);
};

export const makeEmptyNode = (): EmptyNode => {
  return {
    type: "path",
    position: 0,
    value: undefined,
    steps: [
      {
        value: "undefined",
        type: "name",
        position: 0,
      },
    ],
  };
};

export type EmptyNode = Omit<PathNode, "value" | "steps"> & {
  value: undefined;
  steps: [Omit<NameNode, "value"> & { value: "undefined" }];
};

export const emptyASTNode: EmptyNode = makeEmptyNode();

/**
 * Checks whether the node represents an AST that evaluates to an `undefined` value.
 * For example, the `undefined` would evaluate to AST that fullfil checks within this function.
 *
 * Since jsonata does not really have a notion of an "empty" value, we have picked the `undefined` to denote an absence of a value in AST.
 */
export const isEmptyNode = (node: any) => {
  if (node.type !== "path") {
    return false;
  }

  if (node.steps.length !== 1) {
    return false;
  }

  const [firstStep] = node.steps;
  if (firstStep.type !== "name") {
    return false;
  }

  return firstStep.value === emptyASTNode.steps[0].value && firstStep.type === emptyASTNode.steps[0].type;
};

/**
 * Checks whether the node represents an AST that evaluates to a JSONata function.
 * For example, the `$length("hi")` would evaluate to AST that fullfil checks within this function.
 */
export const isFunctionNode = (node: any): node is FunctionNode => {
  if (node.type !== "function") {
    return false;
  }

  if (node.value !== "(") {
    return false;
  }

  return true;
};

/**
 * Checks whether the node represents an AST that evaluates to a JSONata condition.
 * For example, the `property = 3 ? "three": "not three"` would evaluate to AST that fullfil checks within this function.
 */
export const isConditionNode = (node: any): node is ConditionNode => {
  return node.type === "condition";
};

interface NormalizedArrayOfObjectsToMapOperationNodeProps {
  mapOperationContext: MapOperationContextNode;
  node: NormalizedArrayOfObjectsNode;
}

/**
 * Given a `NormalizedArrayOfObjects` node and the node describing the map operation context,
 * transforms the `node` to a `MapOperation` node where the `map operation body` is the first item from the array.
 *
 * Since the `node` parameter has to be of type `NormalizedArrayOfObjectsNode` we know that the `expressions` will contain only a single item,
 * which AST representation evaluates to an object.
 */
export const normalizedArrayOfObjectsToMapOperationNode = ({
  mapOperationContext,
  node,
}: NormalizedArrayOfObjectsToMapOperationNodeProps): MapOperationNode => {
  const mapOperationBodyNode: ObjectUnaryNode = {
    ...node.expressions[0],
    keepArray: true,
  };

  if (isPathLookupNode(mapOperationContext)) {
    const mapOperationNode: MapOperationNode = {
      position: 0,
      steps: [...mapOperationContext.steps, mapOperationBodyNode],
      type: "path",
      value: node.value,
      keepSingletonArray: true,
    };

    return mapOperationNode;
  }

  const mapOperationNode: MapOperationNode = {
    position: 0,
    steps: [mapOperationContext, mapOperationBodyNode],
    type: "path",
    value: node.value,
    keepSingletonArray: true,
  };

  return mapOperationNode;
};

export const mapOperationToNormalizedArrayOfObjectNode = (node: MapOperationNode): NormalizedArrayOfObjectsNode => {
  const mapOperationBodyNode = node.steps[node.steps.length - 1] as ObjectUnaryNode;
  const arrayItemNode: ObjectUnaryNode = { ...mapOperationBodyNode, keepArray: undefined };

  const normalizedArrayOfObjectsNode: NormalizedArrayOfObjectsNode = {
    position: 0,
    expressions: [arrayItemNode],
    type: "unary",
    value: "[",
    consarray: false,
  };

  return normalizedArrayOfObjectsNode;
};

interface UpdateMapOperationNodeContextProps {
  node: MapOperationNode;
  newMapOperationContext: MapOperationContextNode;
}

/**
 * Swaps the "map operation context" in the node which describe an map operation.
 *
 * @example Given a `node` which AST serializes to the following expression:
 * foo.bar.baz.{"key": "static_value"}
 *
 * And the `newMapOperationContext` which AST serializes to the following expression:
 * new.context
 *
 * The resulting node will serialize to the following expression:
 * new.context.{"key": "value"}
 */
export const updateMapOperationContextNode = ({ newMapOperationContext, node }: UpdateMapOperationNodeContextProps) => {
  const mapOperationBodyNode = node.steps[node.steps.length - 1] as ObjectUnaryNode;

  if (isPathLookupNode(newMapOperationContext)) {
    return {
      ...node,
      steps: [...newMapOperationContext.steps, mapOperationBodyNode],
    };
  }

  return {
    ...node,
    steps: [newMapOperationContext, mapOperationBodyNode],
  };
};
