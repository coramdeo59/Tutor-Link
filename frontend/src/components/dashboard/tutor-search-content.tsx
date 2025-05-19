"use client"

import { useState } from "react"
import { Search, Filter, Star, MapPin, GraduationCap, Calendar, Clock, Bookmark, DollarSign } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for subjects and grade levels - using the data structure from our reference tables
interface Subject {
  id: number;
  name: string;
}

interface GradeLevel {
  id: number;
  name: string;
}

const subjects: Subject[] = [
  { id: 1, name: "Mathematics" },
  { id: 2, name: "English" },
  { id: 3, name: "Science" },
  { id: 4, name: "History" },
  { id: 5, name: "Foreign Languages" },
  { id: 6, name: "Computer Science" },
  { id: 7, name: "Arts" },
  { id: 8, name: "Music" }
]

const gradeLevels: GradeLevel[] = [
  { id: 1, name: "1st Grade" },
  { id: 2, name: "2nd Grade" },
  { id: 3, name: "3rd Grade" },
  { id: 4, name: "4th Grade" },
  { id: 5, name: "5th Grade" },
  { id: 6, name: "6th Grade" },
  { id: 7, name: "7th Grade" },
  { id: 8, name: "8th Grade" },
  { id: 9, name: "9th Grade" },
  { id: 10, name: "10th Grade" },
  { id: 11, name: "11th Grade" },
  { id: 12, name: "12th Grade" }
]

// Mock data for tutors
const tutors = [
  {
    id: 1,
    name: "David Johnson",
    photo: "",
    rating: 4.8,
    reviewCount: 124,
    hourlyRate: 45,
    subjects: ["Mathematics", "Physics"],
    gradeLevels: ["9th Grade", "10th Grade", "11th Grade", "12th Grade"],
    location: "Chicago, IL",
    education: "M.S. in Mathematics, University of Chicago",
    experience: "7 years of tutoring experience",
    bio: "I specialize in making complex math and physics concepts easy to understand. My students consistently improve their grades and test scores."
  },
  {
    id: 2,
    name: "Sarah Williams",
    photo: "",
    rating: 4.9,
    reviewCount: 86,
    hourlyRate: 50,
    subjects: ["English", "Literature"],
    gradeLevels: ["6th Grade", "7th Grade", "8th Grade", "9th Grade"],
    location: "Boston, MA",
    education: "B.A. in English Literature, Harvard University",
    experience: "5 years of tutoring experience",
    bio: "I'm passionate about helping students develop strong writing skills and a love for literature. I take a personalized approach to each student's needs."
  },
  {
    id: 3,
    name: "Michael Chen",
    photo: "",
    rating: 4.7,
    reviewCount: 53,
    hourlyRate: 40,
    subjects: ["Computer Science", "Mathematics"],
    gradeLevels: ["9th Grade", "10th Grade", "11th Grade", "12th Grade"],
    location: "San Francisco, CA",
    education: "B.S. in Computer Science, Stanford University",
    experience: "3 years of tutoring experience",
    bio: "Former software engineer turned educator. I help students understand programming concepts and prepare for computer science courses and competitions."
  }
]

export function TutorSearchContent() {
  // State for filters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([])
  const [selectedGradeLevels, setSelectedGradeLevels] = useState<number[]>([])
  const [priceRange, setPriceRange] = useState([0, 100])
  const [showFilters, setShowFilters] = useState(false)
  
  // Toggle subject selection
  const toggleSubject = (subjectId: number) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectId) 
        ? prev.filter(id => id !== subjectId) 
        : [...prev, subjectId]
    )
  }
  
  // Toggle grade level selection
  const toggleGradeLevel = (gradeLevelId: number) => {
    setSelectedGradeLevels(prev => 
      prev.includes(gradeLevelId) 
        ? prev.filter(id => id !== gradeLevelId) 
        : [...prev, gradeLevelId]
    )
  }
  
  // Filter tutors based on criteria
  const filteredTutors = tutors.filter(tutor => {
    // Filter by search query
    if (searchQuery && !tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !tutor.subjects.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false
    }
    
    // Filter by subjects
    if (selectedSubjects.length > 0 && 
        !selectedSubjects.some(subjectId => 
          tutor.subjects.includes(subjects.find(s => s.id === subjectId)?.name || ""))) {
      return false
    }
    
    // Filter by grade levels
    if (selectedGradeLevels.length > 0 && 
        !selectedGradeLevels.some(gradeLevelId => 
          tutor.gradeLevels.includes(gradeLevels.find(g => g.id === gradeLevelId)?.name || ""))) {
      return false
    }
    
    // Filter by price range
    if (tutor.hourlyRate < priceRange[0] || tutor.hourlyRate > priceRange[1]) {
      return false
    }
    
    return true
  })
  
  // Get initials from name
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('')
  }
  
  return (
    <div className="space-y-6">
      {/* Search and filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by tutor name or subject..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="sm:w-auto w-full"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Select>
            <SelectTrigger className="sm:w-[180px] w-full">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Highest Rating</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
              <SelectItem value="experience">Most Experienced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Advanced filters */}
        {showFilters && (
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Subject filters */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Subjects</h3>
                  <div className="space-y-2">
                    {subjects.map((subject) => (
                      <div key={subject.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`subject-${subject.id}`}
                          checked={selectedSubjects.includes(subject.id)}
                          onCheckedChange={() => toggleSubject(subject.id)}
                        />
                        <Label htmlFor={`subject-${subject.id}`}>{subject.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Grade level filters */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Grade Levels</h3>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {gradeLevels.map((grade) => (
                      <div key={grade.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`grade-${grade.id}`}
                          checked={selectedGradeLevels.includes(grade.id)}
                          onCheckedChange={() => toggleGradeLevel(grade.id)}
                        />
                        <Label htmlFor={`grade-${grade.id}`}>{grade.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Price range filter */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Price Range ($/hour)</h3>
                  <div className="px-2">
                    <Slider 
                      value={priceRange}
                      min={0}
                      max={100}
                      step={5}
                      onValueChange={(value) => setPriceRange(value as number[])}
                    />
                    <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setSelectedSubjects([])
                    setSelectedGradeLevels([])
                    setPriceRange([0, 100])
                  }}
                  className="mr-2"
                >
                  Reset Filters
                </Button>
                <Button 
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Found {filteredTutors.length} tutors matching your criteria
      </div>
      
      {/* Tutor list */}
      <div className="space-y-6">
        {filteredTutors.map((tutor) => (
          <Card key={tutor.id} className="overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/3 p-6 bg-slate-50 flex flex-col items-center md:items-start">
                <Avatar className="h-24 w-24 md:h-16 md:w-16 mb-4">
                  <AvatarImage src={tutor.photo} alt={tutor.name} />
                  <AvatarFallback className="bg-amber-100 text-amber-700 text-lg">
                    {getInitials(tutor.name)}
                  </AvatarFallback>
                </Avatar>
                
                <h3 className="text-xl font-semibold mb-1">{tutor.name}</h3>
                
                <div className="flex items-center mb-3">
                  <Star className="h-4 w-4 text-amber-500 mr-1 fill-amber-500" />
                  <span className="font-medium">{tutor.rating}</span>
                  <span className="text-muted-foreground text-sm ml-1">({tutor.reviewCount} reviews)</span>
                </div>
                
                <div className="flex items-center mb-3">
                  <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
                  <span className="font-medium">${tutor.hourlyRate}/hour</span>
                </div>
                
                <div className="flex items-start mb-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mr-1 mt-0.5" />
                  <span>{tutor.location}</span>
                </div>
                
                <div className="hidden md:flex mt-auto">
                  <Button variant="outline" size="sm" className="mr-2">
                    View Profile
                  </Button>
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                    Book Session
                  </Button>
                </div>
              </div>
              
              <div className="md:w-2/3 p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">About</h4>
                    <p className="text-sm">{tutor.bio}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <GraduationCap className="h-4 w-4 text-muted-foreground mr-2" />
                        <h4 className="text-sm font-medium">Education</h4>
                      </div>
                      <p className="text-sm">{tutor.education}</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center mb-2">
                        <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                        <h4 className="text-sm font-medium">Experience</h4>
                      </div>
                      <p className="text-sm">{tutor.experience}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Subjects</h4>
                    <div className="flex flex-wrap gap-2">
                      {tutor.subjects.map((subject) => (
                        <Badge key={subject} variant="secondary">{subject}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Grade Levels</h4>
                    <div className="flex flex-wrap gap-2">
                      {tutor.gradeLevels.map((grade) => (
                        <Badge key={grade} variant="outline">{grade}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex md:hidden mt-6">
                  <Button variant="outline" className="flex-1 mr-2">
                    View Profile
                  </Button>
                  <Button className="flex-1 bg-amber-600 hover:bg-amber-700">
                    Book Session
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
