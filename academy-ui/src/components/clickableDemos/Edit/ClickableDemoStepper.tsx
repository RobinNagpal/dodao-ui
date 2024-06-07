import ClickableDemoStepperItem from '@/components/clickableDemos/Edit/ClickableDemoStepperItem';
import { Space, UpsertClickableDemoInput } from '@/graphql/generated/generated-types';
import { UpdateClickableDemoFunctions } from '@/components/clickableDemos/Edit/useEditClickableDemo';
import { ClickableDemoErrors } from '@/types/errors/clickableDemoErrors';
import Accordion from '@/utils/accordion/Accordion';
import { CSSProperties, useMemo, useState } from 'react';
import SidebarButton from '@/components/core/buttons/SidebarButton';
import PlusCircle from '@heroicons/react/20/solid/PlusCircleIcon';

interface ClickableDemoCreateStepperProps {
  space: Space;
  clickableDemo: UpsertClickableDemoInput;
  clickableDemoErrors?: ClickableDemoErrors;
  errorColor?: string;
  successColor?: string;
  updateClickableDemoFunctions: UpdateClickableDemoFunctions;
}

function ClickableDemoCreateStepper({
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
        <div id="accordion-collapse" data-accordion="collapse">
          {clickableDemo.steps.map((step, index) => (
            <Accordion
              key={step.id}
              isOpen={openAccordionIndex === index}
              label={`Step ${index + 1}: ${step.tooltipInfo}`}
              onClick={() => toggleAccordion(index)}
              hasError={Boolean(clickableDemoErrors?.steps?.[step.id])}
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
                  moveStepUp={updateClickableDemoFunctions.moveStepUp}
                  moveStepDown={updateClickableDemoFunctions.moveStepDown}
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

export default ClickableDemoCreateStepper;
