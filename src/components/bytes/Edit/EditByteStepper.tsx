import { EditByteType, UpdateByteFunctions } from '@/components/bytes/Edit/editByteHelper';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { UserDiscordConnectType } from '@/types/deprecated/models/enums';
import { ByteErrors } from '@/types/errors/byteErrors';
import PlusCircle from '@heroicons/react/20/solid/PlusCircleIcon';
import { CSSProperties, useMemo } from 'react';
import styled from 'styled-components';
import EditByteStepperItem from './EditByteStepperItem';

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
      <StyledOl className="border-l-2 border-primary w-full" style={styleObject}>
        {byte.steps.map((step, index) => (
          <StyledLi className="mb-2 w-full flex" key={step.uuid}>
            <SvgContainer className="bg-primary w-6 h-6 flex items-center justify-center rounded-full -ml-4">
              <svg
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                className="text-white w-3 h-3"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
              >
                <path
                  fill="currentColor"
                  d="M0 464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V192H0v272zm64-192c0-8.8 7.2-16 16-16h288c8.8 0 16 7.2 16 16v64c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16v-64zM400 64h-48V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H160V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H48C21.5 64 0 85.5 0 112v48h448v-48c0-26.5-21.5-48-48-48z"
                ></path>
              </svg>
            </SvgContainer>
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
        ))}
        <li className="mb-10 flex">
          <SvgContainer className="bg-primary w-6 h-6 flex items-center justify-center rounded-full my-2 -ml-4">
            <svg
              aria-hidden="true"
              focusable="false"
              data-prefix="fas"
              className="text-white w-3 h-3"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
            >
              <path
                fill="currentColor"
                d="M0 464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V192H0v272zm64-192c0-8.8 7.2-16 16-16h288c8.8 0 16 7.2 16 16v64c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16v-64zM400 64h-48V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H160V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H48C21.5 64 0 85.5 0 112v48h448v-48c0-26.5-21.5-48-48-48z"
              ></path>
            </svg>
          </SvgContainer>
          <StyledButton onClick={updateByteFunctions.addStep} className="m-auto rounded-full text-white flex items-center font-bold justify-center">
            <PlusCircle height={40} width={40} />
          </StyledButton>
        </li>
      </StyledOl>
    </div>
  );
}

export default EditByteStepper;
