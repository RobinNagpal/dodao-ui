import { EditByteType, UpdateByteFunctions } from '@/components/bytes/Edit/editByteHelper';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { UserDiscordConnectType } from '@/types/deprecated/models/enums';
import { ByteErrors } from '@/types/errors/byteErrors';
import PlusCircle from '@heroicons/react/20/solid/PlusCircleIcon';
import { CSSProperties, useMemo } from 'react';
import styled from 'styled-components';
import EditByteStepperItem from './EditByteStepperItem';
import React, { useState } from 'react';
import { Accordion } from '@/utils/accordion/accordion';

interface EditByteStepperProps {
  space: SpaceWithIntegrationsFragment;
  byte: EditByteType;
  byteErrors?: ByteErrors;
  errorColor?: string;
  successColor?: string;
  updateByteFunctions: UpdateByteFunctions;
}

const StyledOl = styled.ol`
  list-style: none;
  border-color: var(--primary-color);
`;

const StyledLi = styled.ol`
  list-style: none;
`;

const StepperItemContainer = styled.div`
  width: 100%;
`;

const StyledButton = styled.button`
  svg {
    fill: var(--primary-color);
    color: var(--primary-color);
  }
`;
function EditByteStepper({ space, byte, byteErrors, errorColor = '#d32f2f', successColor = '#00813a', updateByteFunctions }: EditByteStepperProps) {
  const [openAccordionIndex, setOpenAccordionIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenAccordionIndex((currentIndex) => (currentIndex === index ? null : index));
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
      <StyledOl className="w-full" style={styleObject}>
        <div id="accordion-collapse" data-accordion="collapse">
          {byte.steps.map((step, index) => (
              <Accordion
              key={step.uuid}
              isOpen={openAccordionIndex === index}
              label={`Step ${index + 1}: ${step.name}`}
              onClick={() => toggleAccordion(index)}
            >
              <StyledLi className="w-full flex">
                <StepperItemContainer>
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
                </StepperItemContainer>
              </StyledLi>
            </Accordion>
          ))}
        </div>
        <li className="mb-10 flex">
          <StyledButton onClick={updateByteFunctions.addStep} className="m-auto rounded-full text-white flex items-center font-bold justify-center">
            <PlusCircle height={40} width={40} />
          </StyledButton>
        </li>
      </StyledOl>
    </div>
  );
}

export default EditByteStepper;
