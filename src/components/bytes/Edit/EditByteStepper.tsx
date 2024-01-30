import { EditByteType, UpdateByteFunctions } from '@/components/bytes/Edit/editByteHelper';
import SidebarButton from '@/components/core/buttons/SidebarButton';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { UserDiscordConnectType } from '@/types/deprecated/models/enums';
import { ByteErrors } from '@/types/errors/byteErrors';
import Accordion from '@/utils/accordion/Accordion';
import PlusCircle from '@heroicons/react/20/solid/PlusCircleIcon';
import React, { CSSProperties, useMemo, useState } from 'react';
import EditByteStepperItem from './EditByteStepperItem';

interface EditByteStepperProps {
  space: SpaceWithIntegrationsFragment;
  byte: EditByteType;
  byteErrors?: ByteErrors;
  errorColor?: string;
  successColor?: string;
  updateByteFunctions: UpdateByteFunctions;
}
function EditByteStepper({ space, byte, byteErrors, errorColor = '#d32f2f', successColor = '#00813a', updateByteFunctions }: EditByteStepperProps) {
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

  const byteHasDiscordEnabled = useMemo(() => {
    for (let i = 0; i < byte.steps.length; i++) {
      for (let j = 0; j < byte.steps[i].stepItems.length; j++) {
        if (byte.steps[i].stepItems[j].type === UserDiscordConnectType) {
          return true;
        }
      }
    }
    return false;
  }, [byte]);

  return (
    <div className="w-full flex flex-row">
      <div className="w-full" style={styleObject}>
        <div id="accordion-collapse" data-accordion="collapse">
          {byte.steps.map((step, index) => (
            <Accordion
              key={step.uuid}
              isOpen={openAccordionIndex === index}
              label={`Step ${index + 1}: ${step.name}`}
              onClick={() => toggleAccordion(index)}
              hasError={Boolean(byteErrors?.steps?.[step.uuid])}
              errorMessage="This Step has an error!!"
            >
              <div className="w-full">
                <EditByteStepperItem
                  space={space}
                  byte={byte}
                  byteErrors={byteErrors}
                  byteHasDiscordEnabled={byteHasDiscordEnabled}
                  step={step}
                  stepIndex={index}
                  stepErrors={byteErrors?.steps?.[step.uuid]}
                  updateStep={updateByteFunctions.updateStep}
                  moveStepUp={updateByteFunctions.moveStepUp}
                  moveStepDown={updateByteFunctions.moveStepDown}
                  removeStep={updateByteFunctions.removeStep}
                />
              </div>
            </Accordion>
          ))}
        </div>
        <li className="mb-10 flex">
          <SidebarButton onClick={updateByteFunctions.addStep} className="m-auto" primary>
            <PlusCircle height={40} width={40} />
          </SidebarButton>
        </li>
      </div>
    </div>
  );
}

export default EditByteStepper;
