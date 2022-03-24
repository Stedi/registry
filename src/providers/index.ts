import { StripeProvider } from "./stripe";
import { ShopifyProvider } from "./shopify";
import { KlaviyoProvider } from "./klaviyo";
import ramp from "./ramp";
import { XPOLogisticsProvider } from "./xpoLogistics";
import { FlexportProvider } from "./flexport";

export default {
  stripe: new StripeProvider(),
  shopify: new ShopifyProvider(),
  xpoLogistics: new XPOLogisticsProvider(),
  flexport: new FlexportProvider(),
  klaviyo: new KlaviyoProvider(),
  ramp,
};
