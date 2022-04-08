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

export default {
  stripe: new StripeProvider(),
  shopify: new ShopifyProvider(),
  twilio: new TwilioProvider(),
  netsuite: new NetsuiteProvider(),
  ramp: new RampProvider(),
  flexport: new FlexportProvider(),
  klaviyo: new KlaviyoProvider(),
  xpoLogistics: new XPOLogisticsProvider(),
  maersk: new MaerskProvider(),
  baton: new BatonProvider(),
  square: new SquareProvider(),
  shipbob: new ShipbobProvider(),
};
