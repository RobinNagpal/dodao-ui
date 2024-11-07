import { UpdateByteFunctions } from '@/components/bytes/Edit/useEditByte';
import { EditByteType } from '@/types/request/ByteRequests';
import SidebarButton from '@dodao/web-core/components/core/buttons/SidebarButton';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { UserDiscordConnectType } from '@dodao/web-core/types/deprecated/models/enums';
import { ByteErrors } from '@dodao/web-core/types/errors/byteErrors';
import Accordion from '@dodao/web-core/utils/accordion/Accordion';
import PlusCircle from '@heroicons/react/20/solid/PlusCircleIcon';
import React, { CSSProperties, useMemo, useState } from 'react';
import EditByteStepperItem from './EditByteStepperItem';
import Button from '@dodao/web-core/components/core/buttons/Button';
import EditCompletionScreenStepperItem from './EditCompletionScreenStepperItem';

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
  const [showCompletionScreen, setShowCompletionScreen] = useState<boolean>(false);

  const showCompletionAccordion = () => {
    setShowCompletionScreen(true);
    setOpenAccordionIndex(byte.steps.length);
  };

  const removeCompletionScreen = () => {
    updateByteFunctions.removeCompletionScreen();
    setShowCompletionScreen(false);
  };

  const toggleAccordion = (e: React.MouseEvent<HTMLElement>, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenAccordionIndex(() => (openAccordionIndex === index ? null : index));
  };

  const shouldShowCompletionAccordion = useMemo(() => {
    return showCompletionScreen || (byte.completionScreen !== null && byte.completionScreen !== undefined);
  }, [showCompletionScreen, byte.completionScreen]);
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
              onClick={(e: React.MouseEvent<HTMLElement>) => toggleAccordion(e, index)}
              hasError={Boolean(byteErrors?.steps?.[step.uuid])}
              errorMessage="This Step has an error!!"
            >
              <div className="w-full px-4 lg:px-8">
                <EditByteStepperItem
                  space={space}
                  byte={byte}
                  byteErrors={byteErrors}
                  byteHasDiscordEnabled={byteHasDiscordEnabled}
                  step={step}
                  stepIndex={index}
                  stepErrors={byteErrors?.steps?.[step.uuid]}
                  updateStep={updateByteFunctions.updateStep}
                  moveStepUp={(uuid: string) => {
                    updateByteFunctions.moveStepUp(uuid);
                    setOpenAccordionIndex(index - 1);
                  }}
                  moveStepDown={(uuid: string) => {
                    updateByteFunctions.moveStepDown(uuid);
                    setOpenAccordionIndex(index + 1);
                  }}
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
        {shouldShowCompletionAccordion && (
          <Accordion
            key="completion-screen"
            isOpen={openAccordionIndex === byte.steps.length}
            label="Completion Screen"
            onClick={(e: React.MouseEvent<HTMLElement>) => toggleAccordion(e, byte.steps.length)}
            hasError={Boolean(byteErrors?.completionScreen)}
            errorMessage="Completion Screen has an error!!"
          >
            <div className={`w-full ${openAccordionIndex === byte.steps.length ? 'visible' : 'hidden'}`}>
              <EditCompletionScreenStepperItem
                byteErrors={byteErrors}
                byte={byte}
                space={space}
                updateByteCompletionScreen={updateByteFunctions.updateCompletionScreen}
                removeCompletionScreen={removeCompletionScreen}
                addButtonLabel={updateByteFunctions.addCallToActionButtonLabel}
                addButtonLink={updateByteFunctions.addCallToActionButtonLink}
                removeCompletionScreenItemButton={updateByteFunctions.removeCallToActionButton}
              />
            </div>
          </Accordion>
        )}

        {!shouldShowCompletionAccordion && (
          <div className="mt-4 flex justify-end">
            <Button className="" onClick={showCompletionAccordion}>
              Add Completion Screen
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default EditByteStepper;
