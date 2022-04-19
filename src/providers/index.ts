import { BatonProvider } from "./baton";
import { ConvoyProvider } from "./convoy";
import { FedexShipProvider } from "./fedex/ship";
import { FlexportProvider } from "./flexport";
import { FreightOSProvider } from "./freightos";
import { KlaviyoProvider } from "./klaviyo";
import { MaerskProvider } from "./maersk";
import { NetsuiteProvider } from "./netsuite";
import { RampProvider } from "./ramp";
import { ShipbobProvider } from "./shipbob";
import { ShopifyProvider } from "./shopify";
import { SquareProvider } from "./square";
import { StripeProvider } from "./stripe";
import { TwilioProvider } from "./twilio";
import { UPSFreightShipProvider } from "./ups/freightShip";
import { UPSShipmentProvider } from "./ups/shipment";
import { UPSTrackProvider } from "./ups/track";
import { QuickbooksProvider } from "./quickbooks";
import { FedexShipProvider } from "./fedex/ship";
import { ConvoyProvider } from "./convoy";
import { FreightOSProvider } from "./freightos";
import { WebCargoProvider } from "./webcargo";
import { XeroAccountingProvider } from "./xero/accounting";
import { XPOLogisticsProvider } from "./xpoLogistics";

export default {
  baton: new BatonProvider(),
  convoy: new ConvoyProvider(),
  fedexShip: new FedexShipProvider(),
  flexport: new FlexportProvider(),
  freightos: new FreightOSProvider(),
  klaviyo: new KlaviyoProvider(),
  maersk: new MaerskProvider(),
  netsuite: new NetsuiteProvider(),
  ramp: new RampProvider(),
  shipbob: new ShipbobProvider(),
  quickbooks: new QuickbooksProvider(),
  shopify: new ShopifyProvider(),
  square: new SquareProvider(),
  stripe: new StripeProvider(),
  twilio: new TwilioProvider(),
  upsFreightShip: new UPSFreightShipProvider(),
  upsShipment: new UPSShipmentProvider(),
  upsTrack: new UPSTrackProvider(),
  webCargo: new WebCargoProvider(),
  xeroAccounting: new XeroAccountingProvider(),
  xpoLogistics: new XPOLogisticsProvider(),
};
