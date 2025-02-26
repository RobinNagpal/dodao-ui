'use client';

import { useEffect, useState } from 'react';
import Block from '@dodao/web-core/components/app/Block';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { useRouter } from 'next/navigation';
import StyledSelect from '@dodao/web-core/components/core/select/StyledSelect';
import { SectorsData } from '@/types/public-equity/sector';
import { submitEquity } from '@/util/submit-equity';

export default function EditPublicEquityView(props: { gicsData: SectorsData }) {
  const { gicsData } = props;
  const [projectUpserting, setProjectUpserting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const sectorKeys = Object.keys(gicsData);
  const [selectedSector, setSelectedSector] = useState(sectorKeys[0]);
  const [selectedIndustryGroup, setSelectedIndustryGroup] = useState(() => {
    const industryGroups = Object.keys(gicsData[selectedSector]?.industryGroups || {});
    return industryGroups[0] || '';
  });
  const [selectedIndustry, setSelectedIndustry] = useState(() => {
    const industries = Object.keys(gicsData[selectedSector]?.industryGroups[selectedIndustryGroup]?.industries || {});
    return industries[0] || '';
  });
  const [selectedSubIndustry, setSelectedSubIndustry] = useState(() => {
    const subIndustries = Object.keys(gicsData[selectedSector]?.industryGroups[selectedIndustryGroup]?.industries[selectedIndustry]?.subIndustries || {});
    return subIndustries[0] || '';
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const industryGroups = Object.keys(gicsData[selectedSector]?.industryGroups || {});
    setSelectedIndustryGroup(industryGroups[0] || '');
  }, [selectedSector]);

  useEffect(() => {
    const industries = Object.keys(gicsData[selectedSector]?.industryGroups[selectedIndustryGroup]?.industries || {});
    setSelectedIndustry(industries[0] || '');
  }, [selectedIndustryGroup, selectedSector]);

  useEffect(() => {
    const subIndustries = Object.keys(gicsData[selectedSector]?.industryGroups[selectedIndustryGroup]?.industries[selectedIndustry]?.subIndustries || {});
    setSelectedSubIndustry(subIndustries[0] || '');
  }, [selectedIndustry, selectedIndustryGroup, selectedSector]);

  const handleSaveProject = async () => {
    const publicEquity = {
      sector: { id: gicsData[selectedSector].id, name: gicsData[selectedSector].name },
      industryGroup: {
        id: gicsData[selectedSector].industryGroups[selectedIndustryGroup].id,
        name: gicsData[selectedSector].industryGroups[selectedIndustryGroup].name,
      },
      industry: {
        id: gicsData[selectedSector].industryGroups[selectedIndustryGroup].industries[selectedIndustry].id,
        name: gicsData[selectedSector].industryGroups[selectedIndustryGroup].industries[selectedIndustry].name,
      },
      subIndustry: {
        id: gicsData[selectedSector].industryGroups[selectedIndustryGroup].industries[selectedIndustry].subIndustries[selectedSubIndustry].id,
        name: gicsData[selectedSector].industryGroups[selectedIndustryGroup].industries[selectedIndustry].subIndustries[selectedSubIndustry].name,
      },
      // Add other necessary publicEquity fields here
    };
    setProjectUpserting(true);

    try {
      const response = await submitEquity(publicEquity);

      if (response.success) {
        // router.push(`/crowd-funding/projects/${project.projectId}`);
      } else {
        alert(`Error: ${response.message}`);
      }
    } catch (error) {
      console.error('Project submission failed:', error);
      alert('An error occurred while submitting the project.');
    } finally {
      setProjectUpserting(false);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <Block title="Project Information" className="font-semibold text-color">
      <StyledSelect
        label="Sector"
        selectedItemId={selectedSector}
        items={sectorKeys.map((key) => ({ id: key, label: gicsData[key].name }))}
        setSelectedItemId={(value) => setSelectedSector(value!)}
      />
      <StyledSelect
        label="Industry Group"
        selectedItemId={selectedIndustryGroup}
        items={Object.keys(gicsData[selectedSector]?.industryGroups || {}).map((key) => ({
          id: key,
          label: gicsData[selectedSector].industryGroups[key].name,
        }))}
        setSelectedItemId={(value) => setSelectedIndustryGroup(value!)}
      />
      <StyledSelect
        label="Industry"
        selectedItemId={selectedIndustry}
        items={Object.keys(gicsData[selectedSector]?.industryGroups[selectedIndustryGroup]?.industries || {}).map((key) => ({
          id: key,
          label: gicsData[selectedSector].industryGroups[selectedIndustryGroup].industries[key].name,
        }))}
        setSelectedItemId={(value) => setSelectedIndustry(value!)}
      />
      <StyledSelect
        label="Sub-Industry"
        selectedItemId={selectedSubIndustry}
        items={Object.keys(gicsData[selectedSector]?.industryGroups[selectedIndustryGroup]?.industries[selectedIndustry]?.subIndustries || {}).map((key) => ({
          id: key,
          label: gicsData[selectedSector].industryGroups[selectedIndustryGroup].industries[selectedIndustry].subIndustries[key].name,
        }))}
        setSelectedItemId={(value) => setSelectedSubIndustry(value!)}
      />
      <div className="flex justify-center items-center mt-6">
        <Button onClick={handleSaveProject} loading={projectUpserting} disabled={projectUpserting} className="block" variant="contained" primary>
          Save
        </Button>
      </div>
    </Block>
  );
}
