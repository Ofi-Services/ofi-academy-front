import { useState, useMemo } from "react"
import { FileText, Download, Clock, Search, ExternalLink } from "lucide-react"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Input } from "@/shared/components/ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card"

// Mock data for training resources
const mockResources = [
  {
    id: "1",
    title: "React Best Practices Guide",
    description: "Comprehensive guide covering modern React patterns, hooks, and performance optimization techniques.",
    type: "PDF",
    category: "Development",
    fileSize: "2.5 MB",
    duration: "45 min read",
    accessType: "download",
    uploadedDate: "2024-10-15",
    tags: ["React", "Frontend", "Best Practices"]
  },
  {
    id: "2",
    title: "API Design Workshop Recording",
    description: "Workshop session covering RESTful API design principles, authentication, and documentation.",
    type: "Video",
    category: "Development",
    fileSize: "450 MB",
    duration: "2h 30min",
    accessType: "download",
    uploadedDate: "2024-10-12",
    tags: ["API", "Backend", "Design"]
  },
  {
    id: "3",
    title: "Leadership Skills Workbook",
    description: "Interactive workbook with exercises and frameworks for developing leadership capabilities.",
    type: "PDF",
    category: "Leadership",
    fileSize: "5.2 MB",
    duration: "1h 15min",
    accessType: "download",
    uploadedDate: "2024-10-08",
    tags: ["Leadership", "Management", "Skills"]
  },
  {
    id: "4",
    title: "Udemy - Advanced SQL Course",
    description: "Complete online course covering advanced SQL techniques, optimization, and real-world projects.",
    type: "Link",
    category: "Development",
    duration: "12h course",
    accessType: "link",
    url: "https://udemy.com/advanced-sql",
    uploadedDate: "2024-10-05",
    tags: ["Database", "SQL", "Online Course"]
  },
  {
    id: "5",
    title: "Agile Methodology Presentation",
    description: "Slide deck covering Agile principles, Scrum framework, and practical implementation strategies.",
    type: "Presentation",
    category: "Project Management",
    fileSize: "12 MB",
    duration: "30 min",
    accessType: "download",
    uploadedDate: "2024-09-28",
    tags: ["Agile", "Scrum", "Methodology"]
  },
  {
    id: "6",
    title: "Google UX Design Certificate",
    description: "Professional certificate program covering UX design fundamentals, prototyping, and user research.",
    type: "Link",
    category: "Design",
    duration: "6 months",
    accessType: "link",
    url: "https://grow.google/ux-design",
    uploadedDate: "2024-09-25",
    tags: ["UX", "Design", "Certificate"]
  },
  {
    id: "7",
    title: "AWS Architecture Center",
    description: "Official AWS documentation and best practices for cloud architecture and design patterns.",
    type: "Link",
    category: "Development",
    duration: "Self-paced",
    accessType: "link",
    url: "https://aws.amazon.com/architecture",
    uploadedDate: "2024-09-20",
    tags: ["Cloud", "Architecture", "AWS"]
  },
  {
    id: "8",
    title: "Communication Skills Training",
    description: "Practical guide to improving workplace communication, presentation skills, and conflict resolution.",
    type: "Document",
    category: "Soft Skills",
    fileSize: "4.1 MB",
    duration: "1h 30min",
    accessType: "download",
    uploadedDate: "2024-09-15",
    tags: ["Communication", "Soft Skills", "Presentation"]
  },
  {
    id: "9",
    title: "OWASP Security Guidelines",
    description: "Industry-standard security guidelines and best practices from the Open Web Application Security Project.",
    type: "Link",
    category: "Security",
    duration: "Ongoing reference",
    accessType: "link",
    url: "https://owasp.org/www-project-top-ten",
    uploadedDate: "2024-09-10",
    tags: ["Security", "Best Practices", "OWASP"]
  },
  {
    id: "10",
    title: "LinkedIn Learning - Project Management",
    description: "Comprehensive project management course covering planning, execution, and team leadership.",
    type: "Link",
    category: "Project Management",
    duration: "8h course",
    accessType: "link",
    url: "https://linkedin.com/learning/project-management",
    uploadedDate: "2024-09-05",
    tags: ["Project Management", "Leadership", "Online Course"]
  },
  {
    id: "11",
    title: "Docker and Kubernetes Guide",
    description: "Complete guide to containerization with Docker and orchestration with Kubernetes.",
    type: "PDF",
    category: "Development",
    fileSize: "6.3 MB",
    duration: "2h read",
    accessType: "download",
    uploadedDate: "2024-08-30",
    tags: ["Docker", "Kubernetes", "DevOps"]
  },
  {
    id: "12",
    title: "Coursera - Data Science Specialization",
    description: "Johns Hopkins University's comprehensive data science program covering R, statistics, and machine learning.",
    type: "Link",
    category: "Data Science",
    duration: "11 months",
    accessType: "link",
    url: "https://coursera.org/specializations/jhu-data-science",
    uploadedDate: "2024-08-25",
    tags: ["Data Science", "Machine Learning", "Statistics"]
  }
]

// Resource Card Component
function ResourceCard({ resource }: { resource: typeof mockResources[0] }) {
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      PDF: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      Video: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      Document: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      Presentation: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      Link: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    }
    return colors[type] || "bg-gray-100 text-gray-800"
  }

  const isLink = resource.accessType === "link"

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge className={getTypeColor(resource.type)} variant="secondary">
            {resource.type}
          </Badge>
          <span className="text-xs text-muted-foreground">{resource.uploadedDate}</span>
        </div>
        <CardTitle className="text-xl line-clamp-2">{resource.title}</CardTitle>
        <CardDescription className="line-clamp-3">{resource.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4">
        <div className="flex flex-wrap gap-2">
          {resource.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          {resource.fileSize && (
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>{resource.fileSize}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{resource.duration}</span>
          </div>
          <div className="flex items-center gap-2">
            {isLink ? (
              <>
                <ExternalLink className="w-4 h-4" />
                <span>External resource</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Downloadable file</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-2">
        {isLink ? (
          <Button className="flex-1" variant="default" asChild>
            <a href={resource.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Link
            </a>
          </Button>
        ) : (
          <>
            <Button className="flex-1" variant="default">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button variant="outline">
              Preview
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}

export default function TrainingResources() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [isLoading] = useState(false) // Mock loading state

  // Extract unique categories and types
  const categories = useMemo(() => {
    const uniqueCategories = new Set(mockResources.map(resource => resource.category))
    return Array.from(uniqueCategories).sort()
  }, [])

  const types = useMemo(() => {
    const uniqueTypes = new Set(mockResources.map(resource => resource.type))
    return Array.from(uniqueTypes).sort()
  }, [])

  // Filter resources
  const filteredResources = useMemo(() => {
    return mockResources.filter(resource => {
      // Filter by search term
      const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      
      // Filter by category
      const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory
      
      // Filter by type
      const matchesType = selectedType === "all" || resource.type === selectedType
      
      return matchesSearch && matchesCategory && matchesType
    })
  }, [searchTerm, selectedCategory, selectedType])

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Training Resources</h1>
          <Skeleton className="h-10 w-40" />
        </div>
        
        {/* Filters Loading Skeleton */}
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1 max-w-md" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-48" />
        </div>
        
        {/* Resources Loading Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-96 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Training Resources</h1>
        <Button variant="default">
          <FileText className="w-4 h-4 mr-2" />
          Upload Resource
        </Button>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Type Filter */}
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {types.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredResources.length} of {mockResources.length} resources
      </div>

      {/* Resource Cards */}
      {filteredResources.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No resources found</AlertTitle>
          <AlertDescription>
            Try adjusting your search or filters to find what you're looking for.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      )}
    </div>
  )
}