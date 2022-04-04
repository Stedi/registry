import {
  EntitySchema,
  OpenAPI3Schema,
  OpenAPIProvider,
  Provider,
} from "../provider";
import * as github from "../github";
import openAPIParser from "@readme/openapi-parser";
import _ from "lodash";

export class TwilioProvider implements OpenAPIProvider {
  isEnabled(): boolean {
    return true;
  }

  async getVersions(): Promise<string[]> {
    return [
      "twilio_messaging_v1",
      "twilio_api_v2010",
      "twilio_events_v1",
      "twilio_taskrouter_v1",
    ];
  }

  async getSchema(version: string): Promise<OpenAPI3Schema> {
    const definition = await github.getRaw(
      "twilio",
      "twilio-oai",
      "main",
      `spec/json/${version}.json`
    );
    return {
      type: "openapi-v3",
      versionName: version,
      value: definition,
      entities: [
        "api.v2010.account.application",
        "api.v2010.account.call",
        "api.v2010.account.conference",
        "api.v2010.account",
        "api.v2010.account.message",
        "api.v2010.account.recording",
        "api.v2010.account.transcription",
        "events.v1.subscription",
        "events.v1.schema",
        "messaging.v1.service",
        "taskrouter.v1.workspace",
        "taskrouter.v1.workspace.activity",
        "taskrouter.v1.workspace.event",
        "taskrouter.v1.workspace.task",
        "taskrouter.v1.workspace.workflow",
      ],
    };
  }

  async unbundle(bundle: OpenAPI3Schema): Promise<EntitySchema[]> {
    const dereferenced = await openAPIParser.dereference(bundle.value as any);

    const hasComponents = "components" in dereferenced;
    if (!hasComponents) throw new Error("Expected components");

    return Object.entries(dereferenced.components?.schemas ?? {})
      .filter(([key]) => !bundle.entities || bundle.entities.includes(key))
      .map(([key, value]) => ({
        name: key,
        schema: sanitizeSchema(value),
      }));
  }
}
function sanitizeSchema(schema: unknown) {
  return JSON.parse(
    JSON.stringify(schema, (key, value) => {
      if (value?.format === "date-time-rfc-2822") {
        delete value.format;
      }

      if (value?.nullable) {
        delete value.nullable;
      }

      return value;
    })
  );
}
