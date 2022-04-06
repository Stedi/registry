export function generateMarkdownTableRow({ schemaName, providerName, target }: GenerateMarkdownTableProps) {
  return [
    `[${schemaName}.json](https://raw.githubusercontent.com/Stedi/registry/main/${target})`,
    generateMapFromSchemaMarkdownButton({ target, providerName, schemaName }),
    generateMapToSchemaMarkdownButton({ target, providerName, schemaName }),
  ];
}

function generateMapFromSchemaMarkdownButton({ target, providerName, schemaName }: GenerateMarkdownTableProps) {
  const mappingName = encodeURIComponent(`Mapping from ${capitalizeFirstLetter(providerName)}'s ${schemaName} schema`);
  return `[![Map from this schema](/images/MapFromThisSchema.svg)](https://terminal.stedi.com/mappings/import?name=${mappingName}&referrer=registry-repo&source_json_schema=https://raw.githubusercontent.com/Stedi/registry/main/${target})`;
}

function generateMapToSchemaMarkdownButton({ target, providerName, schemaName }: GenerateMarkdownTableProps) {
  const mappingName = encodeURIComponent(`Mapping to ${capitalizeFirstLetter(providerName)}'s ${schemaName} schema`);
  return `[![Map to this schema](/images/MapToThisSchema.svg)](https://terminal.stedi.com/mappings/import?name=${mappingName}&referrer=registry-repo&target_json_schema=https://raw.githubusercontent.com/Stedi/registry/main/${target})`;
}

interface GenerateMarkdownTableProps {
  schemaName: string;
  target: string;
  providerName: string;
}

function capitalizeFirstLetter(str: string) {
  return str[0].toUpperCase() + str.slice(1);
}
