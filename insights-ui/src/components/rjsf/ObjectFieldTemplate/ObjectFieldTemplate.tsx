import {
  canExpand,
  descriptionId,
  FormContextType,
  getTemplate,
  getUiOptions,
  ObjectFieldTemplateProps,
  RJSFSchema,
  StrictRJSFSchema,
  titleId,
} from '@rjsf/utils';

export default function ObjectFieldTemplate<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>({
  description,
  title,
  properties,
  required,
  uiSchema,
  idSchema,
  schema,
  formData,
  onAddClick,
  disabled,
  readonly,
  registry,
}: ObjectFieldTemplateProps<T, S, F>) {
  const uiOptions = getUiOptions<T, S, F>(uiSchema);
  const TitleFieldTemplate = getTemplate<'TitleFieldTemplate', T, S, F>('TitleFieldTemplate', registry, uiOptions);
  const DescriptionFieldTemplate = getTemplate<'DescriptionFieldTemplate', T, S, F>('DescriptionFieldTemplate', registry, uiOptions);
  // Button templates are not overridden in the uiSchema
  const {
    ButtonTemplates: { AddButton },
  } = registry.templates;

  return (
    <>
      {title && <TitleFieldTemplate id={titleId<T>(idSchema)} title={title} required={required} schema={schema} uiSchema={uiSchema} registry={registry} />}
      {description && (
        <DescriptionFieldTemplate id={descriptionId<T>(idSchema)} description={description} schema={schema} uiSchema={uiSchema} registry={registry} />
      )}
      <div className="p-0">
        {properties.map((element: any, index: number) => (
          <div key={index} className={`${element.hidden ? 'hidden' : ''} mb-2.5 flex`}>
            <div className="w-full"> {element.content}</div>
          </div>
        ))}
        {canExpand(schema, uiSchema, formData) ? (
          <div className="flex">
            <div className="ml-auto w-1/4 py-4">
              <AddButton
                onClick={onAddClick(schema)}
                disabled={disabled || readonly}
                className="object-property-expand"
                uiSchema={uiSchema}
                registry={registry}
              />
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
