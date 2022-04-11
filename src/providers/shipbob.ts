import axios from "axios";
import { OpenAPI3Schema } from "../provider";
import { OpenAPIProvider } from "./openapi";

export class ShipbobProvider extends OpenAPIProvider {
  constructor() {
    super({
      name: "Shipbob",
      description:
        "ShipBob is a global logistics company that offers an e-commerce fulfillment order platform for direct-to-​consumer brands.",
      logoUrl: "https://logo.clearbit.com/shipbob.com",
      versions: ["1.0"],
      baseUrl: "https://developer.shipbob.com/page-data/api-docs/page-data.json",
      docsLink: "https://developer.shipbob.com/api-docs/",
      entities: [
        "ShipBob.Orders.Presentation.ViewModels.CanceledOrderViewModel",
        "ShipBob.Orders.Presentation.ViewModels.ShipmentViewModel",
        "ShipBob.Orders.Presentation.ViewModels.OrderViewModel",
        "ShipBob.Orders.Presentation.Models.CreateOrderModel",
        "Shipbob.Inventory.Api.ViewModels.InventoryViewModel",
        "ShipBob.Orders.Presentation.ViewModels.ParentCartonViewModel",
        "Shipbob.Receiving.Public.Api.Models.ReceivingOrderViewModel",
        "Shipbob.Returns.Public.Api.ViewModels.ReturnOrderViewModel",
        "Shipbob.Products.Api.ViewModels.Public.ProductViewModel",
        "ShipBob.Orders.Presentation.ViewModels.CartonViewModel",
        "Integrations.Location.Public.Api.ViewModels.LocationViewModel",
        "ShipBob.Orders.Presentation.Models.EstimateFulfillmentRequestModel",
        "ShipBob.Orders.Presentation.ViewModels.RecipientInfoViewModel",
        "ShipBob.Orders.Presentation.ViewModels.RecipientViewModel",
        "Integrations.Location.Public.Api.ViewModels.ServiceViewModel",
        "Shipbob.Receiving.Public.Api.Models.FulfillmentCenterViewModel",
        "Shipbob.Products.Api.Models.Public.CreateProductModel",
        "ShipBob.Orders.Presentation.ViewModels.TrackingViewModel",
        "ShipBob.Orders.Presentation.ViewModels.AddressViewModel",
      ],
      sanitizeSchema,
    });
  }

  async getSchema(version: string): Promise<OpenAPI3Schema> {
    const definition = await axios.get(this.baseUrl!);

    return {
      type: "openapi-v3",
      versionName: version,
      // Extracting the definitions from the Gatsby's page-data.json
      value: JSON.parse(definition.data.result.data.openapiJson.fields.openapi),
      entities: this.entities,
    };
  }
}

function sanitizeSchema(schema: unknown) {
  return JSON.parse(
    JSON.stringify(schema, (_, value) => {
      // All oneOf arrays have just one element
      if (value?.oneOf) {
        return value.oneOf[0];
      }

      // minLength in conjunction with array type is unsupported
      if (value.minLength && value.type === "array") {
        delete value.minLength;
      }

      if (value.discriminator) {
        delete value.discriminator;
      }

      return value;
    }),
  );
}
