'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Block from '@dodao/web-core/components/app/Block';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import ConfirmationModal from '@dodao/web-core/src/components/app/Modal/ConfirmationModal';
import { SectorsData } from '@/types/public-equity/sector';

const baseURL = process.env.NEXT_PUBLIC_AGENT_APP_URL?.toString() || '';
const CRITERIA_URL = 'https://dodao-ai-insights-agent.s3.us-east-1.amazonaws.com/public-equities/US/gics/custom-criterias.json';
const CREATE_CRITERIA_API = `${baseURL}/api/public-equities/US/create-ai-criteria`; // Replace with actual API endpoint
const REGENERATE_CRITERIA_API = '/api/regenerate-ai-criteria'; // Replace with actual API endpoint

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

  const handleCreateCriteria = async (industryGroupId: number, type: 'ai' | 'custom') => {
    setUpdating(true);
    try {
      let postData: any = { industryGroupId, type };

      if (type === 'ai') {
        const industryGroup = criteriaData.find((item) => item.industryGroupId === industryGroupId);
        if (industryGroup) {
          postData = {
            industryGroupId: industryGroup.industryGroupId,
            sectorId: industryGroup.sectorId,
            sectorName: industryGroup.sectorName,
            industryGroupName: industryGroup.industryGroupName,
          };
        }
      }

      const response = await axios.post(CREATE_CRITERIA_API, postData);
      if (response.data.success) {
        setCriteriaData((prev) =>
          prev.map((item) =>
            item.industryGroupId === industryGroupId
              ? {
                  ...item,
                  ...(type === 'ai' ? { aiCriteriaFileLocation: response.data.filePath } : { customCriteriaFileLocation: response.data.filePath }),
                }
              : item
          )
        );
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      setError('Failed to create criteria.');
    } finally {
      setUpdating(false);
    }
  };

  const handleRegenerateAICriteria = async () => {
    if (!selectedIndustryGroup) return;

    setUpdating(true);
    setShowConfirmDialog(false);
    try {
      const response = await axios.post(REGENERATE_CRITERIA_API, { industryGroupId: selectedIndustryGroup });
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
                  <div className="flex items-center justify-center gap-2">
                    <IconButton
                      iconName={IconTypes.PlusIcon}
                      tooltip="Create AI Criteria"
                      onClick={() => handleCreateCriteria(item.industryGroupId, 'ai')}
                      disabled={updating}
                      variant="text"
                    />
                    {item.aiCriteriaFileLocation ? (
                      <>
                        <a href={item.aiCriteriaFileLocation} className="text-blue-500 underline">
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
                        />
                      </>
                    ) : null}
                  </div>
                </td>

                {/* Custom Criteria Column */}
                <td className="p-3 border text-left">
                  <div className="flex items-center justify-center gap-2">
                    <IconButton
                      iconName={IconTypes.PlusIcon}
                      tooltip="Create Custom Criteria"
                      onClick={() => handleCreateCriteria(item.industryGroupId, 'custom')}
                      disabled={updating}
                      variant="text"
                    />
                    {item.customCriteriaFileLocation ? (
                      <a href={item.customCriteriaFileLocation} className="text-blue-500 underline">
                        View Custom Criteria
                      </a>
                    ) : null}
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
        askForTextInput={true} // Requires "Confirm" input before proceeding
      />
    </Block>
  );
}
