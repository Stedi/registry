import { StripeProvider } from "./stripe";
import { ShopifyProvider } from "./shopify";
import ramp from "./ramp";
import { FlexportProvider } from "./flexport";

export default {
  stripe: new StripeProvider(),
  shopify: new ShopifyProvider(),
  flexport: new FlexportProvider(),
  ramp,
};
