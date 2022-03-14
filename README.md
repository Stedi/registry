<p align="center">
  <a href="https://stedi.com">
    <img src = "./images/stedi-logo.svg" width = 200px>
  </a>
</p>

Stedi's `Registry` project is a collection of high quality JSON Schemas for popular APIs like Stripe, Shopify, and more. Schemas are helpful to have handy when building integrations; if you're using Stedi, you can use them to quickly create accurate [Mappings](https://www.stedi.com/products/mappings).

Take a look at the [`schemas` directory](https://github.com/Stedi/registry/tree/main/schemas) to see available providers.

#### Featured examples

| Schema           | [Map](https://www.stedi.com/products/mappings) from this schema   |[Map](https://www.stedi.com/products/mappings) to this schema                                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |-------------------------|
| Stripe's Invoice | [![Map from this schema](/images/MapFromThisSchema.svg)](https://terminal.stedi.com/mappings/import?source_json_schema=https://raw.githubusercontent.com/Stedi/registry/main/schemas/stripe/v112/invoice.json)            | [![Map to this schema](/images/MapToThisSchema.svg)](https://terminal.stedi.com/mappings/import?target_json_schema=https://raw.githubusercontent.com/Stedi/registry/main/schemas/stripe/v112/invoice.json) |
| Shopify's Order  | [![Map from this schema](/images/MapFromThisSchema.svg)](https://terminal.stedi.com/mappings/import?source_json_schema=https://raw.githubusercontent.com/Stedi/registry/main/schemas/shopify/webhooks/2022-01/Order.json) | [![Map from this schema](/images/MapToThisSchema.svg)](https://terminal.stedi.com/mappings/import?target_json_schema=https://raw.githubusercontent.com/Stedi/registry/main/schemas/shopify/webhooks/2022-01/Order.json) |

## Read our documentation

- [Mappings guide](https://www.stedi.com/docs/mappings)
- [API Reference](https://www.stedi.com/docs/api/mappings)
- [How to use mappings - Video](https://www.youtube.com/watch?v=b0sPfOrPL3o)

## Get in touch

- [Send us a note](https://www.stedi.com/contact) and let us know how we can help
- [Create an issue](https://github.com/Stedi/registry/issues) in this repo if you encounter a bug or if you have any feedback on how we can improve this resource
- [Request new schema](https://github.com/Stedi/registry/issues/new?assignees=&labels=enhancement&template=add-new-schema.md&title=%5BAdd+new+schema%5D+) if there's a schema you'd like to see added to this registry
