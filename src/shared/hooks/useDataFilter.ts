
import { useState, useMemo } from "react"

interface UseDataFilterOptions<T> {
  data: T[]
  searchFields: (keyof T)[]
  sortField: keyof T
  itemsPerPage?: number
}

export function useDataFilter<T>({
  data,
  searchFields,
  sortField,
  itemsPerPage = 9
}: UseDataFilterOptions<T>) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    const filtered = data.filter((item) => {
      // Search filter
      const matchesSearch = searchTerm === "" || searchFields.some((field) => {
        const value = item[field]
        return typeof value === "string" && 
               value.toLowerCase().includes(searchTerm.toLowerCase())
      })

      // Dynamic filters
      const matchesFilters = Object.entries(filters).every(([key, value]) => {
        if (value === "all") return true
        return item[key as keyof T] === value
      })

      return matchesSearch && matchesFilters
    })

    // Sort
    filtered.sort((a, b) => {
      const valueA = String(a[sortField]).toLowerCase()
      const valueB = String(b[sortField]).toLowerCase()
      
      return sortOrder === "asc" 
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA)
    })

    return filtered
  }, [data, searchTerm, filters, sortOrder, searchFields, sortField])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage)
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredAndSortedData.slice(startIndex, endIndex)
  }, [filteredAndSortedData, currentPage, itemsPerPage])

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1)
  }, [searchTerm, filters, sortOrder])

  const updateFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
  }

  return {
    searchTerm,
    setSearchTerm,
    filters,
    updateFilter,
    sortOrder,
    toggleSortOrder,
    currentPage,
    setCurrentPage,
    filteredAndSortedData,
    paginatedData,
    totalPages
  }
}