
"use client";

import type * as React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { partCategories } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

export const ALL_CATEGORIES_VALUE = "__ALL_CATEGORIES__";
export const ALL_LOCATIONS_VALUE = "__ALL_LOCATIONS__";

interface SearchFilterBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  categoryFilter: string; // This will now receive ALL_CATEGORIES_VALUE when "All" is selected
  onCategoryChange: (category: string) => void;
  locationFilter: string; // This will now receive ALL_LOCATIONS_VALUE when "All" is selected
  onLocationChange: (location: string) => void;
  availableLocations: string[];
}

export function SearchFilterBar({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  locationFilter,
  onLocationChange,
  availableLocations,
}: SearchFilterBarProps) {
  return (
    <Card className="mb-6 shadow-sm">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari nama atau barcode..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={categoryFilter} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-full">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_CATEGORIES_VALUE}>All Categories</SelectItem>
              {partCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={locationFilter} onValueChange={onLocationChange}>
            <SelectTrigger className="w-full">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Filter by location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_LOCATIONS_VALUE}>All Locations</SelectItem>
              {availableLocations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
