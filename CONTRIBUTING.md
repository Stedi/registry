# Welcome to Registry contributing guide

Thank you for investing your time in contributing to our project! Any contribution you make will be reflected on [stedi.com/registry/json-schemas](https://www.stedi.com/registry/json-schemas) :sparkles:.

This guide will give you an overview of the contribution workflow from creating a provider, creating a PR, reviewing, and merging the PR.

### Adding a provider

Please create a new file in the `src/providers` repository to add a new provider. The file name should be the provider name + `.ts` suffix, and the file should contain the logic to fetch the provider data.

If your provider is exposing their API using OpenAPI or Swagger, you can use the following template to automate this process:

```ts
import { OpenAPIProvider } from "./openapi";

export class MyCompanyNewProvider extends OpenAPIProvider {
  constructor() {
    super({
      name: "MyCompany",
      logoUrl: "https://logo.clearbit.com/my-company.com",
      description: "My Company is a company...",
      versions: ["v1"],
      baseUrl: "https://docs.my-company.com/meta/v1/openapi.json",
    });
  }
}
```

Please also add your provider to the `src/providers/index.ts` file.

After doing so, you can run commands `npm run generate && npm run validate` to ensure that your provider's schemas are generating correctly and are valid.

You can also skip this step and check the validation results by observing Github Actions check after submitting a PR.
