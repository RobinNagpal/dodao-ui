

- We have a component for other form elements as well
```tsx

import Input from '@dodao/web-core/components/core/input/Input';
import StyledSelect from '@dodao/web-core/components/core/select/StyledSelect';
import TextareaAutosize from '@dodao/web-core/components/core/textarea/TextareaAutosize';


<Input modelValue={formData.name} onUpdate={(val) => setFormData((s) => ({ ...s, name: val as string }))} className="custom-classes" helpText="Some help text">
  Prompt Name
</Input>

<StyledSelect
  label={'Output Schema'}
  selectedItemId={formData.outputSchema}
  items={schemas?.map((schema: PromptSchema) => ({ id: schema.filePath, label: `${schema.title} - ${schema.filePath}` })) || []}
  setSelectedItemId={(value) => setFormData((s) => ({ ...s, outputSchema: value as string }))}
/>

<TextareaAutosize
  label={'Notes'}
  modelValue={formData.notes}
  autosize={true}
  onUpdate={(value) => setFormData((s) => ({ ...s, notes: value as string }))}
/>

```
- All the actions are protected by the `<PrivateWrapper>` Component.
```tsx
import PrivateWrapper from '@/components/auth/PrivateWrapper';

<PrivateWrapper>
  <div className="flex justify-end mb-4">
    <Button
      loading={financialStatementsLoading}
      primary
      variant="contained"
      onClick={() => setShowConfirmModal(true)}
      disabled={financialStatementsLoading}
    >
      Refetch Financial Statements
    </Button>
  </div>
</PrivateWrapper>
```
