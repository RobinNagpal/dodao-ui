'use client';

import { FullNestedTickerReport, LinkedinProfile } from '@/types/public-equity/ticker-report-types';
import { ArrowTopRightOnSquareIcon, TrashIcon } from '@heroicons/react/20/solid';
import { useState, useCallback, FormEvent } from 'react';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import { Ticker } from '@prisma/client';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import SingleSectionModal from '@dodao/web-core/components/core/modals/SingleSectionModal';
import Input from '@dodao/web-core/components/core/input/Input';
import PrivateWrapper from '@/components/auth/PrivateWrapper';
import Accordion from '@dodao/web-core/utils/accordion/Accordion';
import { safeParseJsonString } from '@/util/safe-parse-json-string';
import TickerMgtTeamAssessmentButton from './TickerMgtButton';

interface DeleteMemberBody {
  publicIdentifier: string;
}

interface AddMemberBody {
  name: string;
  position: string;
}

export interface DebugManagementTeamProps {
  report: FullNestedTickerReport;
  onPostUpdate: () => Promise<void>;
}

export default function DebugManagementTeam({ report, onPostUpdate }: DebugManagementTeamProps) {
  const ticker = report.tickerKey;
  const managementTeam = (report.managementTeam as LinkedinProfile[]) || [];
  const tickerMgtTeamAssessment = safeParseJsonString(report.tickerInfo).managementTeamAssessment ?? '';

  const [selectedPublicId, setSelectedPublicId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<AddMemberBody>({ name: '', position: '' });

  const [selectedCriterionAccordian, setSelectedCriterionAccordian] = useState<string | null>(null);
  const [showRegenerateConfirmModal, setShowRegenerateConfirmModal] = useState(false);

  const {
    postData: regenerateMgtTeamAssessment,
    loading: TickerMgtTeamAssessmentLoading,
    error: TickerMgtTeamAssessmentError,
  } = usePostData<string, {}>({
    errorMessage: 'Failed to repopulate ticker management team assessment.',
  });

  const handleRegenerateMgtTeamAssessment = async () => {
    await regenerateMgtTeamAssessment(`${getBaseUrl()}/api/tickers/${ticker}/ticker-mgt-team-assessment`);
    await onPostUpdate();
  };

  const { postData, loading, error } = usePostData<Ticker, {}>({
    errorMessage: 'Failed to populate management team.',
  });

  const handlePopulateManagementTeam = async () => {
    await postData(`${getBaseUrl()}/api/actions/tickers/${ticker}/linkedIn-profile`);
    await onPostUpdate();
  };

  const { loading: deleteLoading, deleteData } = useDeleteData<Ticker, DeleteMemberBody>({
    successMessage: 'Member deleted successfully.',
    errorMessage: 'Failed to delete member.',
  });

  const openConfirm = useCallback((publicId: string) => {
    setSelectedPublicId(publicId);
    setShowConfirmModal(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedPublicId) return;
    await deleteData(`${getBaseUrl()}/api/actions/tickers/${ticker}/linkedIn-profile`, { publicIdentifier: selectedPublicId });
    await onPostUpdate();
    setShowConfirmModal(false);
    setSelectedPublicId(null);
  }, [deleteData, onPostUpdate, selectedPublicId, ticker]);

  const { putData, loading: updateLoading } = usePutData<Ticker, AddMemberBody>({
    successMessage: 'Member added successfully!',
    errorMessage: 'Failed to add member',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await putData(`${getBaseUrl()}/api/actions/tickers/${ticker}/linkedIn-profile`, { name: formData.name, position: formData.position });
    setShowAddModal(false);
    setFormData({ name: '', position: '' });
    await onPostUpdate();
  };

  return (
    <div className="my-8">
      <div className="flex justify-end mb-4">
        <Button loading={updateLoading} primary variant="contained" onClick={() => setShowAddModal(true)} disabled={updateLoading}>
          Add Member
        </Button>
        {showAddModal && (
          <SingleSectionModal onClose={() => setShowAddModal(false)} open={showAddModal} title="Add Member">
            <form onSubmit={handleSubmit}>
              <div className="text-left my-5">
                <Input modelValue={formData.name} onUpdate={(val) => setFormData((s) => ({ ...s, name: val as string }))}>
                  Name
                </Input>
                <Input modelValue={formData.position} onUpdate={(val) => setFormData((s) => ({ ...s, position: val as string }))}>
                  Position/Title
                </Input>
              </div>

              <Button disabled={updateLoading} variant="contained" primary loading={updateLoading}>
                Submit
              </Button>
            </form>
          </SingleSectionModal>
        )}
      </div>
      <h2 className="text-xl font-semibold mb-6">Management Team</h2>
      {error && <div className="text-red-500">{error}</div>}
      <div className="mx-auto">
        {managementTeam.length > 0 ? (
          <ul role="list" className="flex flex-wrap justify-center gap-10">
            {managementTeam.map((member) => (
              <li key={member.publicIdentifier} className="relative flex flex-col items-center">
                <button onClick={() => openConfirm(member.publicIdentifier)} className="absolute top-0 right-0 p-1">
                  <TrashIcon className="size-6 cursor-pointer link-color" />
                </button>

                {showConfirmModal && selectedPublicId === member.publicIdentifier && (
                  <ConfirmationModal
                    open={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    onConfirm={handleConfirmDelete}
                    title="Delete Member"
                    confirmationText={`Are you sure you want to delete **${member.fullName}** ?`}
                    confirming={deleteLoading}
                    askForTextInput={false}
                  />
                )}

                <img src={member.profilePicUrl ?? '/dummy-avatar.svg'} alt={member.fullName} className="h-32 w-32 rounded-full object-cover" />

                <div className="mt-4 flex items-center space-x-2">
                  <h3 className="font-semibold">{member.fullName}</h3>
                  <a href={`https://www.linkedin.com/in/${member.publicIdentifier}`} target="_blank" rel="noopener noreferrer" title="Open LinkedIn profile">
                    <ArrowTopRightOnSquareIcon className="h-5 w-5 cursor-pointer link-color" />
                  </a>
                </div>

                <p className="mt-1 text-sm text-center max-w-xs">{member.occupation}</p>
              </li>
            ))}
          </ul>
        ) : (
          <Button primary variant="contained" loading={loading} onClick={() => handlePopulateManagementTeam()}>
            Populate Management Team
          </Button>
        )}
      </div>
      <div className="mt-8">
        {TickerMgtTeamAssessmentError && <div className="text-red-500">{TickerMgtTeamAssessmentError}</div>}
        <PrivateWrapper>
          <div className="flex justify-end mb-4">
            <Button
              loading={TickerMgtTeamAssessmentLoading}
              primary
              variant="contained"
              onClick={() => setShowRegenerateConfirmModal(true)}
              disabled={TickerMgtTeamAssessmentLoading}
            >
              Repopulate Mgt Team Assessment
            </Button>
          </div>
        </PrivateWrapper>
        <Accordion
          label={'Ticker Mgt Team Assessment'}
          isOpen={selectedCriterionAccordian === `ticker_mgt`}
          onClick={() => setSelectedCriterionAccordian(selectedCriterionAccordian === `ticker_mgt` ? null : `ticker_mgt`)}
        >
          <div className="mt-4">
            <TickerMgtTeamAssessmentButton
              tickerKey={ticker}
              tickerMgtTeamAssessmentContent={JSON.stringify(tickerMgtTeamAssessment, null, 2) || undefined}
              onUpdate={onPostUpdate}
            />
            <pre className="whitespace-pre-wrap break-words overflow-x-auto max-h-[400px] overflow-y-auto text-xs">
              {tickerMgtTeamAssessment ? JSON.stringify(tickerMgtTeamAssessment, null, 2) : 'Not populated yet'}
            </pre>
          </div>
        </Accordion>
        {showRegenerateConfirmModal && (
          <ConfirmationModal
            open={showRegenerateConfirmModal}
            onClose={() => setShowRegenerateConfirmModal(false)}
            onConfirm={async () => {
              await handleRegenerateMgtTeamAssessment();
              setShowRegenerateConfirmModal(false);
            }}
            title="Repopulate Ticker Mgt Team Assessment"
            confirmationText="Are you sure you want to repopulate the Mgt Team Assessment?"
            askForTextInput={true}
            confirming={TickerMgtTeamAssessmentLoading}
          />
        )}
      </div>
    </div>
  );
}
