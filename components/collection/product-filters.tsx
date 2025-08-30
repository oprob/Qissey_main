'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';

interface FilterSection {
  id: string;
  title: string;
  isOpen: boolean;
}

interface ProductFiltersProps {
  onFiltersChange: (filters: any) => void;
}

const priceRanges = [
  { label: 'Under $50', value: [0, 50] },
  { label: '$50 - $100', value: [50, 100] },
  { label: '$100 - $200', value: [100, 200] },
  { label: '$200 - $500', value: [200, 500] },
  { label: 'Over $500', value: [500, 9999] },
];

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const colors = [
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#FFFFFF' },
  { name: 'Navy', value: '#1F2937' },
  { name: 'Brown', value: '#8B4513' },
  { name: 'Gray', value: '#6B7280' },
  { name: 'Beige', value: '#F5F5DC' },
];

const categories = ['Shirts', 'Pants', 'Dresses', 'Outerwear', 'Accessories', 'Shoes'];

export function ProductFilters({ onFiltersChange }: ProductFiltersProps) {
  const [sections, setSections] = useState<FilterSection[]>([
    { id: 'category', title: 'Category', isOpen: true },
    { id: 'price', title: 'Price Range', isOpen: true },
    { id: 'size', title: 'Size', isOpen: true },
    { id: 'color', title: 'Color', isOpen: false },
  ]);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<number[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const toggleSection = (id: string) => {
    setSections(prev => prev.map(section => 
      section.id === id ? { ...section, isOpen: !section.isOpen } : section
    ));
  };

  const handleCategoryChange = (category: string) => {
    const updated = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    setSelectedCategories(updated);
    onFiltersChange({ categories: updated });
  };

  const handleSizeChange = (size: string) => {
    const updated = selectedSizes.includes(size)
      ? selectedSizes.filter(s => s !== size)
      : [...selectedSizes, size];
    setSelectedSizes(updated);
    onFiltersChange({ sizes: updated });
  };

  const handleColorChange = (color: string) => {
    const updated = selectedColors.includes(color)
      ? selectedColors.filter(c => c !== color)
      : [...selectedColors, color];
    setSelectedColors(updated);
    onFiltersChange({ colors: updated });
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedPriceRange([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    onFiltersChange({});
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedPriceRange.length > 0 || 
                          selectedSizes.length > 0 || selectedColors.length > 0;

  return (
    <div className="space-y-6">
      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Active Filters</h4>
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map(category => (
              <Badge key={category} variant="secondary" className="cursor-pointer">
                {category}
                <button 
                  className="ml-1 text-xs"
                  onClick={() => handleCategoryChange(category)}
                >
                  ×
                </button>
              </Badge>
            ))}
            {selectedSizes.map(size => (
              <Badge key={size} variant="secondary" className="cursor-pointer">
                {size}
                <button 
                  className="ml-1 text-xs"
                  onClick={() => handleSizeChange(size)}
                >
                  ×
                </button>
              </Badge>
            ))}
            {selectedColors.map(color => (
              <Badge key={color} variant="secondary" className="cursor-pointer">
                {color}
                <button 
                  className="ml-1 text-xs"
                  onClick={() => handleColorChange(color)}
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Filter Sections */}
      {sections.map(section => (
        <div key={section.id} className="border-b border-neutral-200 pb-6 last:border-b-0">
          <button
            onClick={() => toggleSection(section.id)}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="font-medium text-neutral-900">{section.title}</h3>
            {section.isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          <motion.div
            initial={false}
            animate={{ height: section.isOpen ? 'auto' : 0, opacity: section.isOpen ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-3">
              {section.id === 'category' && (
                <div className="space-y-2">
                  {categories.map(category => (
                    <label key={category} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                        className="rounded border-neutral-300 text-black focus:ring-black"
                      />
                      <span className="text-sm text-neutral-700">{category}</span>
                    </label>
                  ))}
                </div>
              )}

              {section.id === 'price' && (
                <div className="space-y-2">
                  {priceRanges.map(range => (
                    <label key={range.label} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="priceRange"
                        checked={JSON.stringify(selectedPriceRange) === JSON.stringify(range.value)}
                        onChange={() => setSelectedPriceRange(range.value)}
                        className="border-neutral-300 text-black focus:ring-black"
                      />
                      <span className="text-sm text-neutral-700">{range.label}</span>
                    </label>
                  ))}
                </div>
              )}

              {section.id === 'size' && (
                <div className="grid grid-cols-3 gap-2">
                  {sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => handleSizeChange(size)}
                      className={cn(
                        'py-2 px-3 text-sm border rounded-md transition-colors',
                        selectedSizes.includes(size)
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-400'
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}

              {section.id === 'color' && (
                <div className="grid grid-cols-3 gap-3">
                  {colors.map(color => (
                    <button
                      key={color.name}
                      onClick={() => handleColorChange(color.name)}
                      className={cn(
                        'flex items-center space-x-2 p-2 rounded-md border transition-colors',
                        selectedColors.includes(color.name)
                          ? 'bg-neutral-100 border-black'
                          : 'border-neutral-200 hover:border-neutral-300'
                      )}
                    >
                      <div
                        className="w-4 h-4 rounded-full border border-neutral-300"
                        style={{ backgroundColor: color.value }}
                      />
                      <span className="text-xs text-neutral-700">{color.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      ))}
    </div>
  );
}