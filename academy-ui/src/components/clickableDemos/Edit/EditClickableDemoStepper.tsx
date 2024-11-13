import ClickableDemoStepperItem from '@/components/clickableDemos/Edit/EditClickableDemoStepperItem';
import { UpdateClickableDemoFunctions } from '@/components/clickableDemos/Edit/useEditClickableDemo';
import { UpsertClickableDemoInput } from '@/graphql/generated/generated-types';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import SidebarButton from '@dodao/web-core/components/core/buttons/SidebarButton';
import { ClickableDemoErrors } from '@dodao/web-core/types/errors/clickableDemoErrors';
import Accordion from '@dodao/web-core/utils/accordion/Accordion';
import PlusCircle from '@heroicons/react/20/solid/PlusCircleIcon';
import { CSSProperties, useMemo, useState } from 'react';

interface ClickableDemoCreateStepperProps {
  space: SpaceWithIntegrationsDto;
  clickableDemo: UpsertClickableDemoInput;
  clickableDemoErrors?: ClickableDemoErrors;
  errorColor?: string;
  successColor?: string;
  updateClickableDemoFunctions: UpdateClickableDemoFunctions;
}

export default function EditClickableDemoStepper({
  space,
  clickableDemo,
  clickableDemoErrors,
  errorColor = '#d32f2f',
  successColor = '#00813a',
  updateClickableDemoFunctions,
}: ClickableDemoCreateStepperProps) {
  const errors = clickableDemoErrors;

  const [openAccordionIndex, setOpenAccordionIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenAccordionIndex(() => (openAccordionIndex === index ? null : index));
  };
  const styleObject: CSSProperties = useMemo(() => {
    return {
      '--error-color': errorColor,
      '--success-color': successColor,
    } as CSSProperties;
  }, [errorColor, successColor]);

  return (
    <div className="w-full flex flex-row">
      <div className="w-full" style={styleObject}>
        <div id="accordion-collapse" data-accordion="collapse" className="px-3">
          {clickableDemo.steps.map((step, index) => (
            <Accordion
              key={step.id}
              isOpen={openAccordionIndex === index}
              label={`Step ${index + 1}: ${step.tooltipInfo}`}
              onClick={() => toggleAccordion(index)}
              hasError={Boolean(clickableDemoErrors?.steps?.[index])}
              errorMessage="This Step has an error!!"
            >
              <div className="w-full">
                <ClickableDemoStepperItem
                  space={space}
                  clickableDemo={clickableDemo}
                  clickableDemoErrors={clickableDemoErrors}
                  step={step}
                  stepIndex={index}
                  stepErrors={errors?.steps?.[step.order]}
                  moveStepUp={(stepId: string) => {
                    updateClickableDemoFunctions.moveStepUp(stepId);
                    setOpenAccordionIndex(index - 1);
                  }}
                  moveStepDown={(stepId: string) => {
                    updateClickableDemoFunctions.moveStepDown(stepId);
                    setOpenAccordionIndex(index + 1);
                  }}
                  removeStep={updateClickableDemoFunctions.removeStep}
                  onUpdateStep={updateClickableDemoFunctions.updateStep}
                />
              </div>
            </Accordion>
          ))}
        </div>
        <li className="mb-10 flex">
          <SidebarButton onClick={updateClickableDemoFunctions.addStep} className="m-auto" primary>
            <PlusCircle height={40} width={40} />
          </SidebarButton>
        </li>
      </div>
    </div>
  );
}
