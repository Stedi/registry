import { StripeProvider } from "./stripe";
import { ShopifyProvider } from "./shopify";
import ramp from "./ramp";
import { XPOLogisticsProvider } from "./xpoLogistics";

export default {
  stripe: new StripeProvider(),
  shopify: new ShopifyProvider(),
  xpoLogistics: new XPOLogisticsProvider(),
  ramp,
};
