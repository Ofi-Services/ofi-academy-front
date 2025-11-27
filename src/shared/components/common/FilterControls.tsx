
import { Search, ArrowUpDown } from "lucide-react"
import { Input } from "@/shared/components/ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Button } from "@/shared/components/ui/button"

export interface FilterConfig {
  key: string
  label: string
  placeholder: string
  icon?: React.ComponentType<{ className?: string }>
  options: Array<{ value: string; label: string }>
}

interface FilterControlsProps {
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  filters: FilterConfig[]
  filterValues: Record<string, string>
  onFilterChange: (key: string, value: string) => void
  sortOrder: "asc" | "desc"
  onSortToggle: () => void
  sortLabels?: { asc: string; desc: string }
  className?: string
}

export default function FilterControls({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters,
  filterValues,
  onFilterChange,
  sortOrder,
  onSortToggle,
  sortLabels = { asc: "A-Z", desc: "Z-A" },
  className = ""
}: FilterControlsProps) {
  return (
    <div className={`flex flex-row gap-4 ${className}`}>
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {filters.map((filter) => {
          const Icon = filter.icon
          
          return (
            <Select
              key={filter.key}
              value={filterValues[filter.key] || "all"}
              onValueChange={(value) => onFilterChange(filter.key, value)}
            >
              <SelectTrigger className="w-full sm:w-52">
                <div className="flex items-center gap-2">
                  {Icon && <Icon className="w-4 h-4" />}
                  <SelectValue placeholder={filter.placeholder} />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{filter.placeholder}</SelectItem>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        })}

        {/* Sort Button */}
        <Button
          variant="outline"
          onClick={onSortToggle}
          className="w-full sm:w-auto"
        >
          <ArrowUpDown className="w-4 h-4 mr-2" />
          {sortOrder === "asc" ? sortLabels.asc : sortLabels.desc}
        </Button>
      </div>
    </div>
  )
}