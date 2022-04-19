import { OpenAPI3Schema } from "../../provider";
import * as github from "../../github";
import yaml from "js-yaml";
import { OpenAPIProvider } from "../openapi";

export class XeroAccountingProvider extends OpenAPIProvider {
  constructor() {
    super({
      name: "XeroAccounting",
      description:
        "Xero online accounting software for your business connects you to your bank, accountant, bookkeeper, and other business apps.",
      logoUrl: "https://logo.clearbit.com/xero.com",
      versions: ["3.0.0"],
      baseUrl: "https://raw.githubusercontent.com/XeroAPI/Xero-OpenAPI/master/xero_accounting.yaml",
      docsLink: "https://developer.xero.com/documentation/api/accounting/overview",
      sanitizeSchema,
    });
  }

  override async getSchema(version: string): Promise<OpenAPI3Schema> {
    const definition = await github.getRaw("XeroAPI", "Xero-OpenAPI", "master", "xero_accounting.yaml");

    return {
      type: "openapi-v3",
      versionName: version,
      value: yaml.load(definition as string),
      entities: [
        "AccountType",
        "AccountsPayable",
        "AccountsReceivable",
        "Action",
        "Address",
        "AddressForOrganisation",
        "Attachment",
        "BalanceDetails",
        "Balances",
        "Bill",
        "BrandingTheme",
        "BudgetBalance",
        "CISOrgSetting",
        "CISSetting",
        "ConversionBalances",
        "ConversionDate",
        "Element",
        "Employee",
        "HistoryRecord",
        "ImportSummary",
        "ImportSummaryAccounts",
        "ImportSummaryObject",
        "Item",
        "LineItemTracking",
        "LinkedTransaction",
        "Organisation",
        "Purchase",
        "SalesTrackingCategory",
        "Schedule",
        "TaxComponent",
        "TaxRate",
        "TrackingCategory",
        "TrackingOption",
        "User",
      ],
    };
  }
}

function sanitizeSchema(schema: unknown) {
  const sanitizedSchema = JSON.parse(
    JSON.stringify(schema, (key, value) => {
      if (value?.externalDocs) {
        delete value.externalDocs;
      }

      if (value?.["x-is-money"]) {
        delete value["x-is-money"];
      }

      if (value?.["x-is-msdate"]) {
        delete value["x-is-msdate"];
      }

      if (value?.["x-is-msdate-time"]) {
        delete value["x-is-msdate-time"];
      }

      if (value?.["x-enum-varnames"]) {
        delete value["x-enum-varnames"];
      }

      return value;
    }),
  );

  if (sanitizedSchema.type === undefined) {
    sanitizedSchema.type = Array.isArray(sanitizedSchema.default) ? "array" : "object";
  }

  return sanitizedSchema;
}
