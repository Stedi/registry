import { PostmanProvider } from "./postman";

export class QuickbooksProvider extends PostmanProvider {
  constructor() {
    super({
      name: "Quickbooks",
      description:
        "Intuit QuickBooks is small business financial software supporting small business start-ups to track, organize, and manage their finances.",
      logoUrl: "https://logo.clearbit.com/quickbooks.com",
      versions: ["V3"],
      postmanCollectionId: "12143221-f27bc33f-082f-45f6-b143-cd3c7d4241da",
      docsLink: "https://developers.klaviyo.com/en/reference/api-overview",
    });
  }
}
