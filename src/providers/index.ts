import { StripeProvider } from "./stripe";
import { ShopifyProvider } from "./shopify";
import ramp from "./ramp";

export default {
  stripe: new StripeProvider(),
  shopify: new ShopifyProvider(),
  ramp,
};
