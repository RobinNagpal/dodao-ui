'use client';

import ViewCriteriaModal from '@/components/criteria/ViewCriteriaModal';
import Block from '@dodao/web-core/components/app/Block';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const baseURL = process.env.NEXT_PUBLIC_AGENT_APP_URL?.toString() || '';
const CRITERIA_URL = 'https://dodao-ai-insights-agent.s3.us-east-1.amazonaws.com/public-equities/US/gics/custom-criterias.json';
const CREATE_AI_CRITERIA_API = `${baseURL}/api/public-equities/US/create-ai-criteria`;
const CREATE_CUSTOM_CRITERIA_API = `${baseURL}/api/public-equities/US/create-custom-criteria`;
const REGENERATE_AI_CRITERIA_API = `${baseURL}/api/public-equities/US/regenerate-ai-criteria`;

interface IndustryGroupCriteria {
  sectorId: number;
  sectorName: string;
  industryGroupId: number;
  industryGroupName: string;
  aiCriteriaFileLocation?: string;
  customCriteriaFileLocation?: string;
}

export default function GicsIndustryGroupCriterias() {
  const [isMounted, setIsMounted] = useState(false);
  const [criteriaData, setCriteriaData] = useState<IndustryGroupCriteria[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedIndustryGroupId, setSelectedIndustryGroupId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const [showViewCriteriaModal, setShowViewCriteriaModal] = useState(false);

  const [selectedIndustryGroup, setSelectedIndustryGroup] = useState<IndustryGroupCriteria>();
  const router = useRouter();
  useEffect(() => {
    const fetchCriteria = async () => {
      try {
        const response = await axios.get<{ criteria: IndustryGroupCriteria[] }>(CRITERIA_URL);
        setCriteriaData(response.data.criteria);
      } catch (err) {
        setError('Failed to fetch criteria data.');
      } finally {
        setLoading(false);
      }
    };

    fetchCriteria();
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setSelectedIndustryGroup(criteriaData?.find((item) => item.industryGroupId === selectedIndustryGroupId));
    console.log('selectedIndustryGroup', selectedIndustryGroup);
    console.log('showViewCriteriaModal', showViewCriteriaModal);
  }, [selectedIndustryGroupId]);

  /** Handles AI Criteria Creation */
  const handleCreateAICriteria = async (industryGroupId: number) => {
    setUpdating(true);
    try {
      const industryGroup = criteriaData.find((item) => item.industryGroupId === industryGroupId);
      if (!industryGroup) return;

      const response = await axios.post(CREATE_AI_CRITERIA_API, {
        industryGroupId: industryGroup.industryGroupId,
        sectorId: industryGroup.sectorId,
        sectorName: industryGroup.sectorName,
        industryGroupName: industryGroup.industryGroupName,
      });

      if (response.data.success) {
        setCriteriaData((prev) =>
          prev.map((item) => (item.industryGroupId === industryGroupId ? { ...item, aiCriteriaFileLocation: response.data.filePath } : item))
        );
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      setError('Failed to create AI criteria.');
    } finally {
      setUpdating(false);
    }
  };

  /** Handles Custom Criteria Creation */
  const handleCreateCustomCriteria = async (industryGroupId: number) => {
    setUpdating(true);
    try {
      const response = await axios.post(CREATE_CUSTOM_CRITERIA_API, { industryGroupId });

      if (response.data.success) {
        setCriteriaData((prev) =>
          prev.map((item) => (item.industryGroupId === industryGroupId ? { ...item, customCriteriaFileLocation: response.data.filePath } : item))
        );
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      setError('Failed to create Custom criteria.');
    } finally {
      setUpdating(false);
    }
  };

  /** Handles AI Criteria Regeneration */
  const handleRegenerateAICriteria = async () => {
    if (!selectedIndustryGroupId) return;

    const industryGroup = criteriaData.find((item) => item.industryGroupId === selectedIndustryGroupId);

    if (!industryGroup) return;

    setUpdating(true);
    setShowConfirmDialog(false);
    try {
      const response = await axios.post(REGENERATE_AI_CRITERIA_API, {
        industryGroupId: industryGroup.industryGroupId,
        sectorId: industryGroup.sectorId,
        sectorName: industryGroup.sectorName,
        industryGroupName: industryGroup.industryGroupName,
      });
      if (response.data.success) {
        setCriteriaData((prev) =>
          prev.map((item) => (item.industryGroupId === selectedIndustryGroupId ? { ...item, aiCriteriaFileLocation: response.data.filePath } : item))
        );
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      setError('Failed to regenerate AI criteria.');
    } finally {
      setUpdating(false);
    }
  };

  if (!isMounted) {
    return null;
  }

  console.log({
    showViewCriteriaModal,
    selectedIndustryGroup,
  });

  return (
    <Block title="Industry Groups & Criteria" className="font-semibold text-color">
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300 text-left">
          <thead>
            <tr>
              <th className="p-3 border text-left">Sector</th>
              <th className="p-3 border text-left">Industry Group</th>
              <th className="p-3 border text-left">AI Criteria</th>
              <th className="p-3 border text-left">Custom Criteria</th>
            </tr>
          </thead>
          <tbody>
            {criteriaData.map((item) => (
              <tr key={item.industryGroupId} className="border">
                <td className="p-3 border text-left">{item.sectorName}</td>
                <td className="p-3 border text-left">{item.industryGroupName}</td>

                {/* AI Criteria Column */}
                <td className="p-3 border text-left">
                  <div className="flex gap-2">
                    {!item.aiCriteriaFileLocation ? (
                      <IconButton
                        iconName={IconTypes.PlusIcon}
                        tooltip="Create AI Criteria"
                        onClick={() => handleCreateAICriteria(item.industryGroupId)}
                        disabled={updating}
                        variant="text"
                        className="link-color pointer-cursor"
                      />
                    ) : (
                      <>
                        <span
                          onClick={() => {
                            setSelectedIndustryGroupId(item.industryGroupId);
                            setShowViewCriteriaModal(true);
                          }}
                          className="link-color cursor-pointer mt-2"
                        >
                          View AI Criteria
                        </span>
                        <IconButton
                          iconName={IconTypes.Reload}
                          tooltip="Re-generate AI Criteria"
                          onClick={() => {
                            setSelectedIndustryGroupId(item.industryGroupId);
                            setShowConfirmDialog(true);
                          }}
                          disabled={updating}
                          variant="text"
                          className="link-color pointer-cursor"
                        />
                      </>
                    )}
                  </div>
                </td>

                {/* Custom Criteria Column */}
                <td className="p-3 border text-left">
                  <div className="flex items-center gap-2">
                    {!item.customCriteriaFileLocation ? (
                      <IconButton
                        iconName={IconTypes.PlusIcon}
                        tooltip="Create Custom Criteria"
                        onClick={() => router.push(`/public-equities/common/${item.industryGroupId}/custom-criteria`)}
                        disabled={updating}
                        variant="text"
                        className="link-color pointer-cursor "
                      />
                    ) : (
                      <a href={item.customCriteriaFileLocation} className="link-color pointer-cursor ">
                        View Custom Criteria
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showViewCriteriaModal && selectedIndustryGroup && (
        <ViewCriteriaModal
          open={showViewCriteriaModal}
          onClose={() => setShowViewCriteriaModal(false)}
          title={selectedIndustryGroup?.industryGroupName}
          url={selectedIndustryGroup?.aiCriteriaFileLocation!}
        />
      )}

      {/* Confirmation Modal for AI Regeneration */}
      <ConfirmationModal
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleRegenerateAICriteria}
        confirming={updating}
        title="Regenerate AI Criteria"
        confirmationText="Are you sure you want to re-generate the AI criteria for this industry group?"
        askForTextInput={true}
      />
    </Block>
  );
}
