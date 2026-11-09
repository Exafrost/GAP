/** Returns the list of fields matching the scope given*/
export function GetFieldsOfScope(scope, fields) {
  return fields.filter((field) => (field.scope ?? 'player') === scope);
}