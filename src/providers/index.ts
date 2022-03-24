import { StripeProvider } from "./stripe";
import { ShopifyProvider } from "./shopify";
import { KlaviyoProvider } from "./klaviyo";
import ramp from "./ramp";
import { TwilioProvider } from "./twilio";
import { FlexportProvider } from "./flexport";

export default {
  stripe: new StripeProvider(),
  shopify: new ShopifyProvider(),
  twilio: new TwilioProvider(),
  flexport: new FlexportProvider(),
  klaviyo: new KlaviyoProvider(),
  ramp,
};
