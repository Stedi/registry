import { StripeProvider } from "./stripe";
import { ShopifyProvider } from "./shopify";
import { NetsuiteProvider } from "./netsuite";
import { RampProvider } from "./ramp";
import { KlaviyoProvider } from "./klaviyo";
import { TwilioProvider } from "./twilio";
import { FlexportProvider } from "./flexport";
import { XPOLogisticsProvider } from "./xpoLogistics";
import { MaerskProvider } from "./maersk";
import { BatonProvider } from "./baton";
import { SquareProvider } from "./square";
import { ShipbobProvider } from "./shipbob";
import { UPSFreightShipProvider } from "./ups/freightShip";
import { UPSShipmentProvider } from "./ups/shipment";
import { UPSTrackProvider } from "./ups/track";
import { QuickbooksProvider } from "./quickbooks";
import { FedexShipProvider } from "./fedex/ship";
import { ConvoyProvider } from "./convoy";
import { FreightOSProvider } from "./freightos";

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
  xpoLogistics: new XPOLogisticsProvider(),
};
