import { StripeProvider } from "./stripe";
import { ShopifyProvider } from "./shopify";
import { KlaviyoProvider } from "./klaviyo";
import ramp from "./ramp";
import { FlexportProvider } from "./flexport";

export default {
  stripe: new StripeProvider(),
  shopify: new ShopifyProvider(),
  flexport: new FlexportProvider(),
  klaviyo: new KlaviyoProvider(),
  ramp,
};
