interface GenerateMarkdownTableProps {
  schemaName: string;
  target: string;
  providerName: string;
}

export function generateMarkdownTableRow({
  schemaName,
  providerName,
  target,
}: GenerateMarkdownTableProps) {
  return [
    `[${schemaName}.json](https://raw.githubusercontent.com/Stedi/registry/main/${target})`,
    mapFromThisSchemaWithSource(target, providerName, schemaName),
    mapToThisSchemaWithSource(target, providerName, schemaName),
  ];
}

function mapFromThisSchemaWithSource(
  target: string,
  providerName: string,
  schemaName: string
) {
  const mappingName = encodeURIComponent(
    `Mapping from ${capitalizeFirstLetter(providerName)}'s ${schemaName} schema`
  );
  return `[![Map from this schema](/images/MapFromThisSchema.svg)](https://terminal.stedi.com/mappings/import?name=${mappingName}&source_json_schema=https://raw.githubusercontent.com/Stedi/registry/main/${target})`;
}

function mapToThisSchemaWithSource(
  target: string,
  providerName: string,
  schemaName: string
) {
  const mappingName = encodeURIComponent(
    `Mapping to ${capitalizeFirstLetter(providerName)}'s ${schemaName} schema`
  );
  return `[![Map to this schema](/images/MapToThisSchema.svg)](https://terminal.stedi.com/mappings/import?name=${mappingName}&target_json_schema=https://raw.githubusercontent.com/Stedi/registry/main/${target})`;
}

function capitalizeFirstLetter(str: string) {
  return str[0].toUpperCase() + str.slice(1);
}
