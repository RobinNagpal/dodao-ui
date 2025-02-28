'use client';

import React, { useState, useRef } from 'react';
import { Modal, Box, Button, Typography, IconButton } from '@mui/material';
import { Add, Edit } from '@mui/icons-material';
import ReactJson from 'react-json-view';

interface Criterion {
  key: string;
  name: string;
  shortDescription: string;
  importantMetrics: string[];
  reports: string[];
}

const CriteriaTable = () => {
  const [criteria, setCriteria] = useState<Criterion[]>([]); // Starts empty
  const [open, setOpen] = useState(false);
  const [selectedCriterion, setSelectedCriterion] = useState<Criterion | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Store the original key before editing
  const originalKeyRef = useRef<string | null>(null);

  const handleOpen = (criterion: Criterion | null = null) => {
    if (criterion) {
      originalKeyRef.current = criterion.key; // Store original key
      setSelectedCriterion({ ...criterion }); // Clone for safe editing
      setIsEditing(true);
    } else {
      originalKeyRef.current = null;
      setSelectedCriterion({
        key: '',
        name: '',
        shortDescription: '',
        importantMetrics: [],
        reports: [],
      });
      setIsEditing(false);
    }

    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // ✅ Ensure unique key and prevent null keys
  const handleSave = () => {
    if (!selectedCriterion || selectedCriterion.key.trim() === '') {
      alert('Key cannot be empty!'); // Prevent empty keys
      return;
    }

    setCriteria((prev) => {
      if (isEditing) {
        // Find the original item using stored key and replace it
        return prev.map((c) => (c.key === originalKeyRef.current ? { ...selectedCriterion } : c));
      }

      // Prevent duplicate keys when adding a new criterion
      if (prev.some((c) => c.key === selectedCriterion.key)) {
        alert('Key must be unique!');
        return prev;
      }

      return [...prev, { ...selectedCriterion }];
    });

    handleClose();
  };

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h5" gutterBottom>
        Custom Criteria
      </Typography>
      <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()} sx={{ marginBottom: '10px' }}>
        Add Criterion
      </Button>

      {/* Table structure with headers always visible */}
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
        <thead>
          <tr className="text-color">
            <th style={tableCellStyle}>Key</th>
            <th style={tableCellStyle}>Name</th>
            <th style={tableCellStyle}>Short Description</th>
            <th style={tableCellStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {criteria.length === 0 ? (
            // Show a full-row message when no criteria exist
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', padding: '10px', fontStyle: 'italic' }}>
                No criteria added yet.
              </td>
            </tr>
          ) : (
            criteria.map((criterion) => (
              <tr key={criterion.key}>
                <td style={tableCellStyle}>{criterion.key}</td>
                <td style={tableCellStyle}>{criterion.name}</td>
                <td style={tableCellStyle}>{criterion.shortDescription}</td>
                <td style={tableCellStyle}>
                  <IconButton onClick={() => handleOpen(criterion)}>
                    <Edit />
                  </IconButton>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal for JSON Editing */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6">{isEditing ? 'Edit Criterion' : 'Add Criterion'}</Typography>

          {/* ✅ Updates state without closing the modal */}
          <ReactJson
            src={selectedCriterion || {}}
            onEdit={(edit) => setSelectedCriterion(edit.updated_src as Criterion)}
            onAdd={(add) => setSelectedCriterion(add.updated_src as Criterion)}
            onDelete={(del) => setSelectedCriterion(del.updated_src as Criterion)}
            theme="monokai"
            enableClipboard={false}
          />

          {/* ✅ Save button - users must click to apply changes */}
          <Button onClick={handleSave} sx={{ marginTop: '10px', marginRight: '10px' }} variant="contained">
            Save Changes
          </Button>

          <Button onClick={handleClose} sx={{ marginTop: '10px' }} variant="outlined">
            Close
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

const tableCellStyle = { padding: '10px', border: '1px solid #ddd' };

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '50%',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: '8px',
};

export default CriteriaTable;
