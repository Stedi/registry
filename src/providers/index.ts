import { StripeProvider } from "./stripe";
import { ShopifyProvider } from "./shopify";
import { KlaviyoProvider } from "./klaviyo";
import ramp from "./ramp";

export default {
  stripe: new StripeProvider(),
  shopify: new ShopifyProvider(),
  klaviyo: new KlaviyoProvider(),
  ramp,
};
