'use client';

import { useState, useEffect } from 'react';
import { 
  Measurement, 
  MeasurementSet, 
  MeasurementType, 
  CreateMeasurementData,
  CreateMeasurementSetData,
  MEASUREMENT_CATEGORIES,
  getMeasurementDisplayName 
} from '@/types';
import { DataService } from '@/lib/data-service';
import { formatDate, getCurrentISOString } from '@/utils';

interface ClientMeasurementsProps {
  clientId: string;
  measurements: Measurement[];
  onMeasurementsUpdated: () => void;
}

export default function ClientMeasurements({ 
  clientId, 
  measurements, 
  onMeasurementsUpdated 
}: ClientMeasurementsProps) {
  const [measurementSets, setMeasurementSets] = useState<MeasurementSet[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSet, setSelectedSet] = useState<MeasurementSet | null>(null);
  const [unit, setUnit] = useState<'cm' | 'inches'>('cm');

  useEffect(() => {
    loadMeasurementSets();
  }, [clientId]);

  const loadMeasurementSets = () => {
    const sets = DataService.getMeasurementSets(clientId);
    setMeasurementSets(sets);
  };

  const handleAddMeasurementSet = () => {
    setSelectedSet(null);
    setShowAddForm(true);
  };

  const handleEditMeasurementSet = (set: MeasurementSet) => {
    setSelectedSet(set);
    setShowAddForm(true);
  };

  const handleDeleteMeasurementSet = (setId: string) => {
    if (window.confirm('Are you sure you want to delete this measurement set?')) {
      DataService.deleteMeasurementSet(setId);
      loadMeasurementSets();
      onMeasurementsUpdated();
    }
  };

  const handleFormSubmit = () => {
    setShowAddForm(false);
    setSelectedSet(null);
    loadMeasurementSets();
    onMeasurementsUpdated();
  };

  const handleFormCancel = () => {
    setShowAddForm(false);
    setSelectedSet(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Client Measurements</h3>
          <p className="text-sm text-gray-600">Track and manage client measurements for precise fitting</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Unit:</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as 'cm' | 'inches')}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="cm">Centimeters</option>
              <option value="inches">Inches</option>
            </select>
          </div>
          <button
            onClick={handleAddMeasurementSet}
            className="btn-primary"
          >
            📏 Add Measurements
          </button>
        </div>
      </div>

      {/* Measurement Sets */}
      {measurementSets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-6xl mb-4">📏</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No measurements yet</h3>
          <p className="text-gray-600 mb-6">
            Start by taking the client&apos;s measurements for accurate fitting.
          </p>
          <button
            onClick={handleAddMeasurementSet}
            className="btn-primary"
          >
            Take First Measurements
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {measurementSets.map((set) => (
            <MeasurementSetCard
              key={set.id}
              measurementSet={set}
              displayUnit={unit}
              onEdit={() => handleEditMeasurementSet(set)}
              onDelete={() => handleDeleteMeasurementSet(set.id)}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <MeasurementForm
              clientId={clientId}
              measurementSet={selectedSet}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Measurement Set Card Component
interface MeasurementSetCardProps {
  measurementSet: MeasurementSet;
  displayUnit: 'cm' | 'inches';
  onEdit: () => void;
  onDelete: () => void;
}

function MeasurementSetCard({ measurementSet, displayUnit, onEdit, onDelete }: MeasurementSetCardProps) {
  const convertValue = (value: number, fromUnit: 'cm' | 'inches', toUnit: 'cm' | 'inches'): number => {
    if (fromUnit === toUnit) return value;
    if (fromUnit === 'cm' && toUnit === 'inches') return value / 2.54;
    if (fromUnit === 'inches' && toUnit === 'cm') return value * 2.54;
    return value;
  };

  const formatValue = (measurement: Measurement): string => {
    const convertedValue = convertValue(measurement.value, measurement.unit, displayUnit);
    return `${convertedValue.toFixed(1)} ${displayUnit}`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">{measurementSet.name}</h4>
            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
              <span>📅 {formatDate(measurementSet.takenDate)}</span>
              <span>👤 {measurementSet.takenBy}</span>
              {measurementSet.purpose && <span>🎯 {measurementSet.purpose}</span>}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onEdit}
              className="text-primary-600 hover:text-primary-800 text-sm font-medium"
            >
              ✏️ Edit
            </button>
            <button
              onClick={onDelete}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              🗑️ Delete
            </button>
          </div>
        </div>

        {measurementSet.notes && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">{measurementSet.notes}</p>
          </div>
        )}

        {/* Measurements by Category */}
        <div className="space-y-6">
          {MEASUREMENT_CATEGORIES.map((category) => {
            const categoryMeasurements = measurementSet.measurements.filter(m => 
              category.measurements.includes(m.type)
            );

            if (categoryMeasurements.length === 0) return null;

            return (
              <div key={category.name}>
                <h5 className="font-medium text-gray-900 mb-3">{category.name}</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categoryMeasurements.map((measurement) => (
                    <div key={measurement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">
                        {getMeasurementDisplayName(measurement.type)}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatValue(measurement)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Measurement Form Component
interface MeasurementFormProps {
  clientId: string;
  measurementSet?: MeasurementSet | null;
  onSubmit: () => void;
  onCancel: () => void;
}

function MeasurementForm({ clientId, measurementSet, onSubmit, onCancel }: MeasurementFormProps) {
  const [formData, setFormData] = useState({
    name: measurementSet?.name || '',
    purpose: measurementSet?.purpose || '',
    notes: measurementSet?.notes || '',
    takenBy: measurementSet?.takenBy || '',
    takenDate: measurementSet?.takenDate || getCurrentISOString().split('T')[0],
  });

  const [measurements, setMeasurements] = useState<Record<MeasurementType, { value: string; unit: 'cm' | 'inches' }>>(() => {
    const initialMeasurements: Record<MeasurementType, { value: string; unit: 'cm' | 'inches' }> = {} as any;
    
    // Initialize all measurement types
    Object.values(MeasurementType).forEach(type => {
      const existingMeasurement = measurementSet?.measurements.find(m => m.type === type);
      initialMeasurements[type] = {
        value: existingMeasurement?.value.toString() || '',
        unit: existingMeasurement?.unit || 'cm',
      };
    });

    return initialMeasurements;
  });

  const [activeCategory, setActiveCategory] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMeasurementChange = (type: MeasurementType, field: 'value' | 'unit', value: string) => {
    setMeasurements(prev => ({
      ...prev,
      [type]: { ...prev[type], [field]: value },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Filter out empty measurements
    const validMeasurements: CreateMeasurementData[] = Object.entries(measurements)
      .filter(([_, data]) => data.value.trim() !== '' && !isNaN(parseFloat(data.value)))
      .map(([type, data]) => ({
        clientId,
        type: type as MeasurementType,
        value: parseFloat(data.value),
        unit: data.unit,
        notes: '',
        takenBy: formData.takenBy,
        takenDate: formData.takenDate,
      }));

    if (validMeasurements.length === 0) {
      alert('Please enter at least one measurement.');
      return;
    }

    const measurementSetData: CreateMeasurementSetData = {
      clientId,
      name: formData.name || 'Measurement Set',
      measurements: validMeasurements,
      takenBy: formData.takenBy,
      takenDate: formData.takenDate,
      purpose: formData.purpose,
      notes: formData.notes,
    };

    try {
      if (measurementSet) {
        DataService.updateMeasurementSet(measurementSet.id, measurementSetData);
      } else {
        DataService.createMeasurementSet(measurementSetData);
      }
      onSubmit();
    } catch (error) {
      console.error('Error saving measurement set:', error);
      alert('Failed to save measurements. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {measurementSet ? 'Edit' : 'Add'} Measurements
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Set Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="input-field"
            placeholder="e.g., Initial Measurements, Wedding Dress Fitting"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
          <input
            type="text"
            name="purpose"
            value={formData.purpose}
            onChange={handleInputChange}
            className="input-field"
            placeholder="e.g., Wedding dress, Business suit"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Taken By *</label>
          <input
            type="text"
            name="takenBy"
            value={formData.takenBy}
            onChange={handleInputChange}
            className="input-field"
            placeholder="Staff member name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date Taken *</label>
          <input
            type="date"
            name="takenDate"
            value={formData.takenDate}
            onChange={handleInputChange}
            className="input-field"
            required
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          rows={3}
          className="input-field"
          placeholder="Any additional notes about these measurements..."
        />
      </div>

      {/* Category Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {MEASUREMENT_CATEGORIES.map((category, index) => (
            <button
              key={category.name}
              type="button"
              onClick={() => setActiveCategory(index)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeCategory === index
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {category.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Measurements */}
      <div className="mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            <strong>{MEASUREMENT_CATEGORIES[activeCategory].name}:</strong> {MEASUREMENT_CATEGORIES[activeCategory].description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MEASUREMENT_CATEGORIES[activeCategory].measurements.map((type) => (
            <div key={type} className="flex items-center space-x-3">
              <label className="flex-1 text-sm font-medium text-gray-700">
                {getMeasurementDisplayName(type)}
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={measurements[type].value}
                onChange={(e) => handleMeasurementChange(type, 'value', e.target.value)}
                className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="0.0"
              />
              <select
                value={measurements[type].unit}
                onChange={(e) => handleMeasurementChange(type, 'unit', e.target.value as 'cm' | 'inches')}
                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="cm">cm</option>
                <option value="inches">in</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
        >
          {measurementSet ? 'Update' : 'Save'} Measurements
        </button>
      </div>
    </form>
  );
}