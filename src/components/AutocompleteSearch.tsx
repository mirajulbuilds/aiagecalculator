import React, { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface Celebrity {
  id: string;
  slug: string;
  name: string;
  profession: string;
  image: string;
  birthdate: string;
}

interface AutocompleteSearchProps {
  celebrities: Celebrity[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const AutocompleteSearch: React.FC<AutocompleteSearchProps> = ({
  celebrities,
  value,
  onChange,
  className = ""
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const suggestions = value.trim() 
    ? celebrities
        .filter(celeb => 
          celeb.name.toLowerCase().includes(value.toLowerCase()) ||
          celeb.profession.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 8)
    : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && suggestions[focusedIndex]) {
          window.location.href = `/celebrity/${suggestions[focusedIndex].slug}`;
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setFocusedIndex(-1);
        break;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
        <Input
          ref={inputRef}
          type="search"
          placeholder="Search by name, profession, or country..."
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(true);
            setFocusedIndex(-1);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          className="pl-12 py-5 text-base"
          aria-label="Search celebrities"
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          aria-expanded={showSuggestions && suggestions.length > 0}
        />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <Card 
          ref={suggestionsRef}
          id="search-suggestions"
          className="absolute z-50 w-full mt-2 shadow-xl border-border overflow-hidden"
          role="listbox"
        >
          {suggestions.map((celebrity, index) => (
            <Link
              key={celebrity.id}
              to={`/celebrity/${celebrity.slug}`}
              className={`flex items-center gap-3 p-3 hover:bg-accent/50 transition-colors border-b border-border last:border-b-0 ${
                index === focusedIndex ? 'bg-accent/50' : ''
              }`}
              role="option"
              aria-selected={index === focusedIndex}
              onClick={() => setShowSuggestions(false)}
            >
              <img 
                src={celebrity.image} 
                alt={celebrity.name}
                className="w-12 h-12 rounded-full object-cover"
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{celebrity.name}</p>
                <p className="text-sm text-muted-foreground truncate">{celebrity.profession}</p>
              </div>
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
};
