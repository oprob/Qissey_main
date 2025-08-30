'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ruler, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CustomSizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (measurements: CustomMeasurements) => void;
  productType: string;
}

export interface CustomMeasurements {
  chest?: number;
  waist?: number;
  hips?: number;
  shoulders?: number;
  armLength?: number;
  inseam?: number;
  neck?: number;
  height?: number;
  weight?: number;
}

const measurementFields = {
  shirt: ['chest', 'waist', 'shoulders', 'armLength', 'neck'],
  pants: ['waist', 'hips', 'inseam'],
  dress: ['chest', 'waist', 'hips', 'shoulders'],
  jacket: ['chest', 'waist', 'shoulders', 'armLength'],
  default: ['chest', 'waist', 'hips', 'shoulders', 'height']
};

const measurementLabels = {
  chest: 'Chest',
  waist: 'Waist', 
  hips: 'Hips',
  shoulders: 'Shoulders',
  armLength: 'Arm Length',
  inseam: 'Inseam',
  neck: 'Neck',
  height: 'Height',
  weight: 'Weight'
};

const measurementTips = {
  chest: 'Measure around the fullest part of your chest',
  waist: 'Measure around the narrowest part of your waist',
  hips: 'Measure around the fullest part of your hips',
  shoulders: 'Measure from shoulder point to shoulder point across your back',
  armLength: 'Measure from shoulder to wrist with arm slightly bent',
  inseam: 'Measure from crotch to ankle along the inside of your leg',
  neck: 'Measure around the base of your neck',
  height: 'Your total height in inches',
  weight: 'Your weight in pounds'
};

export function CustomSizeModal({ isOpen, onClose, onSubmit, productType }: CustomSizeModalProps) {
  const [measurements, setMeasurements] = useState<CustomMeasurements>({});
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');
  const [showTips, setShowTips] = useState<string | null>(null);

  const fieldsToShow = measurementFields[productType as keyof typeof measurementFields] || measurementFields.default;

  const handleMeasurementChange = (field: string, value: string) => {
    const numValue = parseFloat(value);
    setMeasurements(prev => ({
      ...prev,
      [field]: isNaN(numValue) ? undefined : numValue
    }));
  };

  const handleSubmit = () => {
    // Validate that at least 3 measurements are provided
    const providedMeasurements = Object.values(measurements).filter(v => v !== undefined && v > 0).length;
    if (providedMeasurements < 3) {
      alert('Please provide at least 3 measurements for accurate sizing');
      return;
    }
    
    onSubmit(measurements);
    onClose();
  };

  const convertToInches = (value: number) => {
    return unit === 'cm' ? value / 2.54 : value;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  <Ruler className="h-6 w-6 text-blue-600" />
                  <div>
                    <h2 className="text-xl font-semibold">Custom Fit Measurements</h2>
                    <p className="text-sm text-neutral-600">Get the perfect fit tailored just for you</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Unit Selection */}
                <div className="flex justify-center">
                  <div className="flex bg-neutral-100 rounded-lg p-1">
                    <button
                      onClick={() => setUnit('inches')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        unit === 'inches' 
                          ? 'bg-white text-black shadow-sm' 
                          : 'text-neutral-600 hover:text-black'
                      }`}
                    >
                      Inches
                    </button>
                    <button
                      onClick={() => setUnit('cm')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        unit === 'cm' 
                          ? 'bg-white text-black shadow-sm' 
                          : 'text-neutral-600 hover:text-black'
                      }`}
                    >
                      Centimeters
                    </button>
                  </div>
                </div>

                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="text-blue-800 font-medium mb-1">How to measure accurately:</p>
                      <ul className="text-blue-700 space-y-1">
                        <li>• Use a flexible measuring tape</li>
                        <li>• Measure over light clothing or undergarments</li>
                        <li>• Stand straight with arms relaxed at your sides</li>
                        <li>• Take measurements twice for accuracy</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Measurement Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fieldsToShow.map((field) => (
                    <div key={field} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-neutral-700">
                          {measurementLabels[field as keyof typeof measurementLabels]}
                        </label>
                        <button
                          onMouseEnter={() => setShowTips(field)}
                          onMouseLeave={() => setShowTips(null)}
                          className="text-neutral-400 hover:text-neutral-600"
                        >
                          <Info className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.5"
                          min="0"
                          placeholder={`Enter ${field} in ${unit}`}
                          value={measurements[field as keyof CustomMeasurements] || ''}
                          onChange={(e) => handleMeasurementChange(field, e.target.value)}
                          className="pr-12"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">
                          {unit}
                        </span>
                      </div>

                      {/* Tooltip */}
                      {showTips === field && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-neutral-800 text-white text-xs p-2 rounded-md"
                        >
                          {measurementTips[field as keyof typeof measurementTips]}
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Additional Info */}
                <div className="bg-neutral-50 rounded-lg p-4">
                  <h3 className="font-medium text-neutral-800 mb-2">What happens next?</h3>
                  <ul className="text-sm text-neutral-600 space-y-1">
                    <li>• Our tailors will create a custom fit profile for you</li>
                    <li>• Your garment will be adjusted to your measurements</li>
                    <li>• Production time: 7-10 business days</li>
                    <li>• Free alterations if adjustments are needed</li>
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-neutral-200 p-6 bg-neutral-50">
                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
                    Save Measurements
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}