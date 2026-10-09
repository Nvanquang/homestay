"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { MapPin, Search, Clock, X, Sparkles } from "lucide-react";
import { DestinationSuggestion } from "../types";
import { getDestinationSuggestions } from "../api/mock-search";

interface DestinationPickerProps {
  value: string;
  onChange: (val: string) => void;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const RECENT_SEARCHES_KEY = "homestay_recent_searches";

export function DestinationPicker({
  value,
  onChange,
  isOpen,
  onOpen,
  onClose,
}: DestinationPickerProps) {
  const t = useTranslations("search.destinationPicker");
  const [suggestions, setSuggestions] = useState<DestinationSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    let active = true;
    getDestinationSuggestions(value).then((res) => {
      if (active) setSuggestions(res);
    });
    return () => {
      active = false;
    };
  }, [value]);

  const saveRecentSearch = (dest: string) => {
    if (!dest.trim()) return;
    try {
      const updated = [dest, ...recentSearches.filter((s) => s !== dest)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleSelect = (selectedText: string) => {
    onChange(selectedText);
    saveRecentSearch(selectedText);
    onClose();
  };

  return (
    <div ref={containerRef} className="relative flex-1">
      <div
        onClick={onOpen}
        className={`px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-full cursor-pointer transition-colors ${
          isOpen ? "bg-white dark:bg-gray-800 shadow-md" : "hover:bg-gray-100/70 dark:hover:bg-gray-800/60"
        }`}
      >
        <span className="block text-xs font-bold text-[var(--color-text-secondary)] tracking-wider">
          {t("label")}
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen) onOpen();
          }}
          placeholder={t("placeholder")}
          className="w-full bg-transparent text-sm font-semibold text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-hidden truncate"
        />
      </div>

      {isOpen && (
        <div className="absolute left-0 top-[115%] w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-2xl border border-[var(--color-border-subtle)] z-50 animate-in fade-in zoom-in-95">
          {recentSearches.length > 0 && !value && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--color-text-secondary)] px-2 mb-2">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {t("recentTitle")}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setRecentSearches([]);
                    localStorage.removeItem(RECENT_SEARCHES_KEY);
                  }}
                  className="text-[11px] text-[var(--color-text-tertiary)] hover:underline"
                >
                  {t("clearRecent")}
                </button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-[var(--color-text-secondary)]" />
                    </div>
                    <span className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                      {item}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <span className="block text-xs font-bold text-[var(--color-text-secondary)] px-2 mb-2">
              {value ? t("suggestionsTitle") : t("popularTitle")}
            </span>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {suggestions.map((sug) => (
                <button
                  key={sug.id}
                  type="button"
                  onClick={() => handleSelect(sug.label)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-[var(--color-text-primary)] truncate">
                      {sug.label}
                    </span>
                    <span className="block text-xs text-[var(--color-text-tertiary)] truncate">
                      {sug.sublabel}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
