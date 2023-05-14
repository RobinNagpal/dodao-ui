import { ByteDetailsFragment, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { UserDiscordConnectType } from '@/types/deprecated/models/enums';
import { ByteErrors } from '@/types/errors/byteErrors';
import { CSSProperties, useMemo } from 'react';
import EditByteStepperItem from './EditByteStepperItem';
import { EditByteType, UpdateByteFunctions } from './useEditByte';

interface EditByteStepperProps {
  space: SpaceWithIntegrationsFragment;
  byte: EditByteType;
  byteErrors?: ByteErrors;
  errorColor?: string;
  successColor?: string;
  updateByteFunctions: UpdateByteFunctions;
}

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
      <ol className="border-l-2 border-primary m-5 w-full" style={styleObject}>
        {byte.steps.map((step) => (
          <li className="ml-10 mb-2 w-full flex" key={step.uuid}>
            <div className="bg-primary w-6 h-6 flex items-center justify-center rounded-full -ml-4">
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
            </div>
            <EditByteStepperItem
              space={space}
              byte={byte}
              byteErrors={byteErrors}
              byteHasDiscordEnabled={byteHasDiscordEnabled}
              step={step}
              stepErrors={byteErrors?.steps?.[step.order]}
              updateStep={updateByteFunctions.updateStep}
              moveStepUp={updateByteFunctions.moveStepUp}
              moveStepDown={updateByteFunctions.moveStepDown}
              removeStep={updateByteFunctions.removeStep}
            />
          </li>
        ))}
        <li className="ml-10 mb-10 flex w-full">
          <div className="bg-primary w-6 h-6 flex items-center justify-center rounded-full -ml-4 my-2">
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
          </div>
          <button
            onClick={updateByteFunctions.addStep}
            className="m-auto rounded-full text-2xl bg-primary w-[48px] text-white flex items-center font-bold justify-center h-[48px]"
          >
            <span className="mb-1">+</span>
          </button>
        </li>
      </ol>
    </div>
  );
}

export default EditByteStepper;
