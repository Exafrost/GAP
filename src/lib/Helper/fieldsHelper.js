/** Returns the list of fields matching the scope given*/
export function GetFieldsOfScope(scope, fields) {
  return fields.filter((field) => (field.scope ?? 'player') === scope);
}

/** Fonction de mapping pour la définition des champs de scoring */
export function GetScoreFieldFormatted(scoreFields) {
  return scoreFields.map(({ id, name, iconPath, computeFunction, ranks, required, type, key }) => ({
      key,
      label: name,
      scope: 'player',
      type: type === 'computed' ? 'computed' : 'number',
      required: required === false ? false : undefined, // obligatoire par défaut, on ne stocke que l'exception
      icon: iconPath || undefined,
      calculator: type === 'computed' ? computeFunction || undefined : undefined,
      ranks: ranks || undefined,
    }));
}