import { StripeProvider } from "./stripe";
import { ShopifyProvider } from "./shopify";
import { NetsuiteProvider } from "./netsuite";
import { RampProvider } from "./ramp";
import { KlaviyoProvider } from "./klaviyo";
import { TwilioProvider } from "./twilio";
import { FlexportProvider } from "./flexport";
import { MaerskProvider } from "./maersk";

export default {
  stripe: new StripeProvider(),
  shopify: new ShopifyProvider(),
  twilio: new TwilioProvider(),
  netsuite: new NetsuiteProvider(),
  ramp: new RampProvider(),
  flexport: new FlexportProvider(),
  klaviyo: new KlaviyoProvider(),
  maersk: new MaerskProvider(),
};
