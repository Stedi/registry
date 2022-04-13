import { OpenAPIProvider } from "../openapi";

export class FedexShipProvider extends OpenAPIProvider {
  constructor() {
    super({
      baseUrl: "https://developer.fedex.com/wirc/json/api_groups/Ship/Shipment-Resource.json",
      description:
        "FedEx provides customers and businesses worldwide with a broad portfolio of transportation, e-commerce, and business services. The Ship API allows you to integrate FedEx shipping capabilities into your application. Using Ship API, you can process and submit shipping requests for packages to FedEx for both domestic and international shipments, as well as the return shipments.",
      docsLink: "https://developer.fedex.com/api/en-us/catalog/ship/v1/docs.html",
      logoUrl: "https://logo.clearbit.com/fedex.com",
      name: "FedEx Ship",
      versions: ["1.0.0"],
      customPath: "fedex/ship/1.0.0/",
      entities: [
        "One_Rate_Shipment",
        "US_Domestic_SingleShot_Multi_Piece_Shipment",
        "US_Domestic_Print_Return_Label_Shipment",
        "US_Domestic_Email_Return_Label_Shipment",
        "International_SingleShot_Multi_Piece_Shipment",
        "Express_OneLabelATATime_Master_Shipment",
        "Express_OneLabelATATime_Child_Shipment",
        "Ground_OneLabelATATime_Master_Shipment",
        "Ground_OneLabelATATime_Child_Shipment",
        "Asynchronous_Multipiece_Shipment",
        "Alcohol_Shipment",
        "US_Domestic_Hold_At_Location_Adult_Signature_Option_Shipment",
        "Electronic_Trade_Documents_Requested_Document_Copies",
        "Ground_HomeDelivery_Shipment_Appointment",
        "International_Shipment",
        "Intra_India_Cash_on_Delivery_and_Delivery_on_Invoice_Acceptance",
        "Intra_Mexico_Express_Saver_Shipment",
        "Intra_UAE_Standard_Overnight_Shipment",
        "Priority_Alert_Freight_Shipment",
        "SmartPost_Shipment_Return",
        "SmartPost_Shipment",
        "US_Express_Freight",
        "US_Express_Shipment",
        "US_Ground_Shipment",
        "International_Print_Return_Shipment",
        "International_Dry_Ice_Shipment",
        "Third_Party_Consigneee_Shipment",
        "Ground_COD_Shipment",
        "Intra_UK_Shipment",
        "Intra_Europe_Shipment",
      ],
    });
  }
}
