import { OpenAPI3Schema } from "../provider";
import * as github from "../github";
import _ from "lodash";
import { OpenAPIProvider } from "./openapi";

export class TwilioProvider extends OpenAPIProvider {
  constructor() {
    super({
      versions: [
        "twilio_messaging_v1",
        "twilio_api_v2010",
        "twilio_events_v1",
        "twilio_taskrouter_v1",
      ],
      baseUrl: "overwritten in getSchema function",
      entities: [
        "person",
        "metric",
        "template",
        "campaign",
        "identify_payload",
        "check_membership_request",
        "check_membership_response",
      ],
      sanitizeSchema,
    });
  }

  override async getSchema(version: string): Promise<OpenAPI3Schema> {
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
