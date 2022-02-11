import OpenAPIParser from "@readme/openapi-parser";
import _ from "lodash";
import { OpenAPIV3 } from "openapi-types";
import { openAPIUrlProvider } from "../provider";

export default openAPIUrlProvider({
  v1: {
    url: "https://docs.ramp.com/openapi/v1/ramp-developer.json",
    transform: async (definition) => {
      const document = (await OpenAPIParser.dereference(definition as any, {
        dereference: { circular: "ignore" },
      })) as OpenAPIV3.Document;

      for (let modelName in (document as any).components.models) {
        delete (document as any).components.models[modelName]["x-examples"];
      }


      return {
        ...document,
        components: {
          ...document.components,
          schemas: (document as any).components.models,
        },
      };
    },
  },
});
