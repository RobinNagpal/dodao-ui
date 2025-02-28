'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Block from '@dodao/web-core/components/app/Block';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import ConfirmationModal from '@dodao/web-core/src/components/app/Modal/ConfirmationModal';
import { SectorsData } from '@/types/public-equity/sector';
import { useRouter } from 'next/navigation';

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

export default function EditPublicEquityView(props: { gicsData: SectorsData }) {
  const { gicsData } = props;
  const [isMounted, setIsMounted] = useState(false);
  const [criteriaData, setCriteriaData] = useState<IndustryGroupCriteria[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedIndustryGroup, setSelectedIndustryGroup] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
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
    if (!selectedIndustryGroup) return;

    const industryGroup = criteriaData.find((item) => item.industryGroupId === selectedIndustryGroup);

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
          prev.map((item) => (item.industryGroupId === selectedIndustryGroup ? { ...item, aiCriteriaFileLocation: response.data.filePath } : item))
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
              <th className="p-3 border text-left">Industry Group</th>
              <th className="p-3 border text-left">AI Criteria</th>
              <th className="p-3 border text-left">Custom Criteria</th>
            </tr>
          </thead>
          <tbody>
            {criteriaData.map((item) => (
              <tr key={item.industryGroupId} className="border">
                <td className="p-3 border text-left">{item.industryGroupName}</td>

                {/* AI Criteria Column */}
                <td className="p-3 border text-left">
                  <div className="flex items-center gap-2">
                    {!item.aiCriteriaFileLocation ? (
                      <IconButton
                        iconName={IconTypes.PlusIcon}
                        tooltip="Create AI Criteria"
                        onClick={() => handleCreateAICriteria(item.industryGroupId)}
                        disabled={updating}
                        variant="text"
                        className="link-color pointer-cursor "
                      />
                    ) : (
                      <>
                        <a href={item.aiCriteriaFileLocation} className="link-color pointer-cursor ">
                          View AI Criteria
                        </a>
                        <IconButton
                          iconName={IconTypes.Reload}
                          tooltip="Re-generate AI Criteria"
                          onClick={() => {
                            setSelectedIndustryGroup(item.industryGroupId);
                            setShowConfirmDialog(true);
                          }}
                          disabled={updating}
                          variant="text"
                          className="link-color pointer-cursor "
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
