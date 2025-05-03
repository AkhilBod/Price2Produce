import React, { useState, useRef } from 'react';
import { Search, X, Plus } from 'lucide-react';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState('');
  const [selectedFilters, setSelectedFilters] = useState(['Everything']);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const filters = ['Everything', 'Image', 'Text'];

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const file = files[0];

    try {
      // Create FormData object to send the file
      const formData = new FormData();
      formData.append('content', file);
      
      // Determine content type based on file type
      let contentType = 'text';
      if (file.type.startsWith('image/')) {
        contentType = 'image';
      } else if (file.type.startsWith('audio/')) {
        contentType = 'audio';
      }
      
      // Add metadata
      formData.append('type', contentType);
      formData.append('tags', JSON.stringify(['uploaded']));

      // Send to your API
      const response = await fetch('http://localhost:3030/api/save', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      // Show success message or trigger refresh
      console.log('File uploaded successfully');
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Rest of your existing code...
  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);

    try {
      let types = [];
      if (selectedFilters.includes('Everything') || selectedFilters.length === 0) {
        types = ['text', 'image'];
      } else {
        types = selectedFilters.map(filter => filter.toLowerCase());
      }

      const queryParams = new URLSearchParams({
        query: query.trim(),
        types: types.join(',')
      });

      const response = await fetch(
        `http://localhost:3030/api/search?${queryParams}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      let transformedResults = [];

      types.forEach((type) => {
        if (data.results[type]) {
          const sourceArray = type === 'image'
            ? data.results[type].data[0]
            : data.results[type].documents[0];

          const resultsForType = sourceArray.map((item, index) => ({
            id: data.results[type].ids[0][index],
            ...(type === 'image' ? { data: item } : { document: item }),
            type: data.results[type].metadatas[0][index].type,
            metadata: {
              ...data.results[type].metadatas[0][index],
              distance: data.results[type].distances[0][index]
            }
          }));

          transformedResults = transformedResults.concat(resultsForType);
        }
      });

      onSearch(transformedResults);
    } catch (error) {
      console.error('Search error:', error);
      onSearch([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setQuery('');
    onSearch([]);
  };

  const handleCheckboxChange = (filter, checked) => {
    if (filter === 'Everything') {
      if (checked) {
        setSelectedFilters(['Everything']);
      } else {
        setSelectedFilters([]);
      }
    } else {
      let updatedFilters = [...selectedFilters];
      if (updatedFilters.includes('Everything')) {
        updatedFilters = updatedFilters.filter((f) => f !== 'Everything');
      }
      if (checked) {
        updatedFilters.push(filter);
      } else {
        updatedFilters = updatedFilters.filter((f) => f !== filter);
      }
      setSelectedFilters(updatedFilters);
    }
  };

  return (
    <div className="w-full px-4 relative">
      <div className="relative flex items-center gap-4">
        <Search className="text-white/50 w-6 h-6" />
        
        <div className="relative flex-1 flex items-center gap-4">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Search your orbit..."
            className="w-full px-6 py-4 text-lg bg-white/10 border border-white/20 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                     placeholder-white/50 text-white"
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 
                       hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,text/*,audio/*"
        />
        
        <button 
          className={`flex items-center justify-center w-12 h-12 rounded-full 
                     ${isUploading ? 'bg-purple-800' : 'bg-purple-600'} 
                     hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 
                     focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent
                     ${isUploading ? 'cursor-wait' : 'cursor-pointer'}`}
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Plus className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="mt-4 flex gap-4">
        {filters.map((filter) => (
          <label key={filter} className="flex items-center text-white">
            <input
              type="checkbox"
              checked={selectedFilters.includes(filter)}
              onChange={(e) => handleCheckboxChange(filter, e.target.checked)}
              className="mr-2"
            />
            {filter}
          </label>
        ))}
      </div>

      {isSearching && (
        <div className="mt-2 text-center text-sm text-white/70">
          Searching...
        </div>
      )}
      
      {isUploading && (
        <div className="mt-2 text-center text-sm text-purple-400">
          Uploading file...
        </div>
      )}
    </div>
  );
};

export default SearchBar;