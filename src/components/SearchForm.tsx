import React, { useState } from 'react';
import { Search, MapPin, Sparkles, Filter, SlidersHorizontal, Loader2, Info } from 'lucide-react';
import { OpportunityFilterOptions } from '../server/types.ts';
import { KNOWN_COUNTRIES } from '../server/services/normalization.ts';

interface SearchFormProps {
  onSearch: (params: {
    country: string;
    region?: string;
    city: string;
    area?: string;
    category: string;
    keyword?: string;
    secondaryKeyword?: string;
    quantity: number;
    filters: OpportunityFilterOptions;
  }) => void;
  isLoading: boolean;
}

const COMMON_CATEGORIES = [
  'Dentists',
  'Restaurants',
  'Real Estate Agencies',
  'Auto Repair',
  'Hotels & Lodging',
  'Construction Companies',
  'Law Firms',
  'Medical Clinics',
  'Beauty Salons',
  'Plumbers',
  'Gyms & Fitness',
  'Clothing Stores',
  'Accounting & Tax',
  'Roofing Contractors',
  'Pet Grooming',
];

const PRESET_GLOBAL_EXAMPLES = [
  { country: 'United States', city: 'New York', category: 'Dentists' },
  { country: 'United Kingdom', city: 'London', category: 'Restaurants' },
  { country: 'United Arab Emirates', city: 'Dubai', category: 'Real Estate Agencies' },
  { country: 'Japan', city: 'Tokyo', category: 'Restaurants' },
  { country: 'Germany', city: 'Berlin', category: 'Auto Repair' },
  { country: 'Brazil', city: 'São Paulo', category: 'Clothing Stores' },
  { country: 'Nigeria', city: 'Lagos', category: 'Hotels & Lodging' },
  { country: 'Australia', city: 'Sydney', category: 'Construction Companies' },
  { country: 'India', city: 'Mumbai', category: 'Medical Clinics' },
];

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [country, setCountry] = useState('United States');
  const [region, setRegion] = useState('');
  const [city, setCity] = useState('New York');
  const [area, setArea] = useState('');
  const [category, setCategory] = useState('Dentists');
  const [keyword, setKeyword] = useState('');
  const [secondaryKeyword, setSecondaryKeyword] = useState('');
  const [quantity, setQuantity] = useState(20);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<OpportunityFilterOptions>({
    noWebsiteOnly: false,
    websiteExistsOnly: false,
    hasPhoneOnly: false,
    activeSocialOnly: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!country.trim() || !city.trim() || !category.trim()) return;

    onSearch({
      country: country.trim(),
      region: region.trim() || undefined,
      city: city.trim(),
      area: area.trim() || undefined,
      category: category.trim(),
      keyword: keyword.trim() || undefined,
      secondaryKeyword: secondaryKeyword.trim() || undefined,
      quantity,
      filters,
    });
  };

  const applyPreset = (preset: { country: string; city: string; category: string }) => {
    setCountry(preset.country);
    setCity(preset.city);
    setCategory(preset.category);
    setRegion('');
    setArea('');
    setKeyword('');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-8">
      {/* Quick Global Sample Bar */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 text-xs text-slate-400 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold uppercase tracking-wider">Quick Global Discovery Queries:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESET_GLOBAL_EXAMPLES.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(preset)}
              className="text-xs px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition"
            >
              {preset.country} → {preset.city} → <span className="text-indigo-300 font-medium">{preset.category}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Location Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
              Country <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                list="country-list"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. United Kingdom"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <datalist id="country-list">
                {Object.values(KNOWN_COUNTRIES).map((c) => (
                  <option key={c.isoCode} value={c.name} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
              City / Municipality <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. London, Tokyo, Dubai"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
              Region / State / Province
            </label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="e.g. Greater London, CA"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
              Area / District / Neighborhood
            </label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. Downtown, Soho, Marina"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Row 2: Category & Keywords */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
              Business Category <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                list="category-suggestions"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Dentists"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <datalist id="category-suggestions">
                {COMMON_CATEGORIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Primary Keyword</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g. pediatric, emergency"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Secondary Keyword</label>
            <input
              type="text"
              value={secondaryKeyword}
              onChange={(e) => setSecondaryKeyword(e.target.value)}
              placeholder="e.g. cosmetic, 24/7"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Quantity</label>
            <select
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={10}>10 establishments</option>
              <option value={20}>20 establishments (Recommended)</option>
              <option value={50}>50 establishments (Deep Scan)</option>
            </select>
          </div>
        </div>

        {/* Filter Toggle Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{showFilters ? 'Hide Advanced Filters' : 'Show Advanced Opportunity Filters'}</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-medium text-sm shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Discovering Real Businesses...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Discover Real Businesses</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Opportunity Filters */}
        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.noWebsiteOnly}
                onChange={(e) =>
                  setFilters({ ...filters, noWebsiteOnly: e.target.checked, websiteExistsOnly: false })
                }
                className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
              />
              <span className="text-slate-300">Only No Website Detected</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.websiteExistsOnly}
                onChange={(e) =>
                  setFilters({ ...filters, websiteExistsOnly: e.target.checked, noWebsiteOnly: false })
                }
                className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
              />
              <span className="text-slate-300">Only Websites That Exist</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.hasPhoneOnly}
                onChange={(e) => setFilters({ ...filters, hasPhoneOnly: e.target.checked })}
                className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
              />
              <span className="text-slate-300">Has Phone Number</span>
            </label>

            <div className="flex items-center space-x-1.5 text-slate-400">
              <Info className="w-3.5 h-3.5 text-slate-500" />
              <span>Deduplication & normalization run automatically</span>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
