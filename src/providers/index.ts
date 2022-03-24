import { StripeProvider } from "./stripe";
import { ShopifyProvider } from "./shopify";
import ramp from "./ramp";
import { TwilioProvider } from "./twilio";

export default {
  stripe: new StripeProvider(),
  shopify: new ShopifyProvider(),
  twilio: new TwilioProvider(),
  ramp,
};
