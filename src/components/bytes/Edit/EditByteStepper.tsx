import { EditByteType, UpdateByteFunctions } from '@/components/bytes/Edit/editByteHelper';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { UserDiscordConnectType } from '@/types/deprecated/models/enums';
import { ByteErrors } from '@/types/errors/byteErrors';
import PlusCircle from '@heroicons/react/20/solid/PlusCircleIcon';
import { CSSProperties, useMemo } from 'react';
import styled from 'styled-components';
import EditByteStepperItem from './EditByteStepperItem';
import React, { useState } from 'react';

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

const SvgContainer = styled.div`
  background-color: var(--primary-color);
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
            <div>
              <h2 id={`accordion-collapse-heading-${index}`}>
                <button
                  type="button"
                  className="flex items-center justify-between w-full p-5 font-medium rtl:text-right text-gray-500 border border-b-0 border-gray-200 rounded-t-xl focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3"
                  data-accordion-target={`#accordion-collapse-body-${index}`}
                  aria-expanded={openAccordionIndex === index}
                  aria-controls={`accordion-collapse-body-${index}`}
                  onClick={() => toggleAccordion(index)}
                >
                  <span className="flex items-center">
                    Step {index + 1}: {step.name}
                  </span>
                  <svg
                    data-accordion-icon
                    className="w-3 h-3 shrink-0"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 10 6"
                    style={{ transform: openAccordionIndex === index ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5 5 1 1 5" />
                  </svg>
                </button>
              </h2>
              <div
                id={`accordion-collapse-body-${index}`}
                className={`${openAccordionIndex === index ? '' : 'hidden'}`}
                aria-labelledby={`accordion-collapse-heading-${index}`}
              >
                <StyledLi className="w-full flex" key={step.uuid}>
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
              </div>
            </div>
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
