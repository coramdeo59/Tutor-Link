import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

import { SearchIcon, BookOpen, Shield, Clock, ClipboardList, ChevronRight, Star } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="font-extrabold text-transparent text-3xl bg-clip-text bg-gradient-to-r from-yellow-600 to-yellow-700">
              Tutor-Link
            </div>
          </div>
          <nav className="hidden md:flex space-x-4 items-center">
            <Link href="/tutors" className="text-gray-600 hover:text-yellow-600 px-3 py-2 rounded-md text-sm font-medium">
              Find Tutors
            </Link>
            <Link href="/how-it-works" className="text-gray-600 hover:text-yellow-600 px-3 py-2 rounded-md text-sm font-medium">
              How It Works
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-yellow-600 px-3 py-2 rounded-md text-sm font-medium">
              Pricing
            </Link>
            <Link href="/auth/login" className="text-gray-700 hover:text-yellow-600 font-medium border border-transparent hover:border-yellow-600 px-4 py-2 rounded-md transition-all">
              Log In
            </Link>
            <Button asChild className="bg-yellow-600 hover:bg-yellow-700">
              <Link href="/auth/register">Sign Up Free</Link>
            </Button>
          </nav>
          <Button variant="ghost" size="icon" className="md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="sr-only">Open menu</span>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-50 to-white"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-0 left-10 w-64 h-64 rounded-full bg-yellow-300"></div>
          <div className="absolute bottom-0 right-10 w-80 h-80 rounded-full bg-yellow-200"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-800 leading-tight">
                Online tutoring with <span className="text-yellow-600">real teachers</span>
              </h1>
              <p className="mt-6 text-xl text-gray-600 max-w-xl">
                Instant online tutoring in all subjects, anytime, anywhere. Connect with expert tutors for personalized 1-on-1 help.
              </p>
              
              {/* Search box */}
              <div className="mt-8 bg-white p-2 rounded-lg shadow-lg max-w-2xl">
                <div className="flex flex-col sm:flex-row">
                  <Input 
                    type="text" 
                    placeholder="Enter your question to connect with a tutor..." 
                    className="flex-grow p-3 text-gray-700 focus:outline-none rounded-lg sm:rounded-r-none sm:border-r border-gray-200"
                  />
                  <Button asChild className="mt-2 sm:mt-0 bg-yellow-600 hover:bg-yellow-700 sm:rounded-l-none">
                    <Link href="/tutors" className="flex items-center">
                      Find Tutor
                      <span className="ml-1 text-xs bg-white/20 px-2 py-0.5 rounded">press ENTER</span>
                    </Link>
                  </Button>
                </div>
              </div>
              
              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild className="bg-yellow-600 hover:bg-yellow-700">
                  <Link href="/auth/register">
                    Sign Up Free
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/how-it-works">
                    How It Works
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="relative lg:block">
              <Card className="relative z-10 overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-w-16 aspect-h-9">
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center p-4">
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                          <BookOpen className="h-10 w-10 text-yellow-600" />
                        </div>
                        <p className="text-gray-600 font-medium">Tutoring Session Demo</p>
                        <p className="text-sm text-gray-500">(Interactive video will be here)</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs text-gray-600">
                            {i}
                          </div>
                        ))}
                      </div>
                      <div className="ml-2 text-sm text-gray-600">
                        <span className="font-medium">500+</span> expert tutors available now
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Decorative dots */}
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-yellow-200 rounded-full opacity-50"></div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-yellow-100 rounded-full opacity-50"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Background decorative element */}
        <div className="absolute right-0 top-0 h-full w-1/3 bg-yellow-50 transform skew-x-12 -translate-x-32 -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Why Students & Parents Choose <span className="text-yellow-600">Tutor-Link</span>
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Our comprehensive platform connects you with expert tutors for a personalized learning experience that gets results.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1 */}
            <Card className="group hover:shadow-xl transition-shadow overflow-hidden">
              <CardContent className="p-6 relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-100 rounded-full -mt-8 -mr-8 group-hover:bg-yellow-200 transition-colors duration-300"></div>
                
                <div className="relative">
                  <div className="h-14 w-14 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600 mb-6 group-hover:scale-110 transition-transform">
                    <BookOpen className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Live Online Sessions</h3>
                  <p className="text-gray-600">
                    Connect instantly with tutors through our integrated video platform with interactive whiteboard and screen sharing.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Feature 2 */}
            <Card className="group hover:shadow-xl transition-shadow overflow-hidden">
              <CardContent className="p-6 relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-100 rounded-full -mt-8 -mr-8 group-hover:bg-yellow-200 transition-colors duration-300"></div>
                
                <div className="relative">
                  <div className="h-14 w-14 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600 mb-6 group-hover:scale-110 transition-transform">
                    <Shield className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Verified Expert Tutors</h3>
                  <p className="text-gray-600">
                    All tutors undergo a rigorous verification process to ensure they have the expertise and teaching skills to deliver results.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="group hover:shadow-xl transition-shadow overflow-hidden">
              <CardContent className="p-6 relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-100 rounded-full -mt-8 -mr-8 group-hover:bg-yellow-200 transition-colors duration-300"></div>
                
                <div className="relative">
                  <div className="h-14 w-14 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600 mb-6 group-hover:scale-110 transition-transform">
                    <Clock className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Flexible Scheduling</h3>
                  <p className="text-gray-600">
                    Book sessions that fit your timetable with on-demand help or recurring appointments at times that work for you.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="group hover:shadow-xl transition-shadow overflow-hidden">
              <CardContent className="p-6 relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-100 rounded-full -mt-8 -mr-8 group-hover:bg-yellow-200 transition-colors duration-300"></div>
                
                <div className="relative">
                  <div className="h-14 w-14 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600 mb-6 group-hover:scale-110 transition-transform">
                    <ClipboardList className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Progress Tracking</h3>
                  <p className="text-gray-600">
                    Monitor learning progress with detailed session reports and achievement tracking for students and parents.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Stats Section */}
          <div className="mt-20 bg-yellow-50 rounded-2xl p-8 shadow-inner">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-extrabold text-yellow-600">500+</div>
                <p className="text-gray-700 mt-2">Expert Tutors</p>
              </div>
              <div>
                <div className="text-4xl font-extrabold text-yellow-600">50+</div>
                <p className="text-gray-700 mt-2">Subject Areas</p>
              </div>
              <div>
                <div className="text-4xl font-extrabold text-yellow-600">10K+</div>
                <p className="text-gray-700 mt-2">Sessions Completed</p>
              </div>
              <div>
                <div className="text-4xl font-extrabold text-yellow-600">4.9</div>
                <p className="text-gray-700 mt-2">Average Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Trusted by Students & Parents
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              See what our users have to say about their experience with Tutor-Link
            </p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Testimonial 1 */}
            <Card className="relative">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                <div className="w-12 h-12 rounded-full bg-yellow-100 border-4 border-white flex items-center justify-center text-yellow-600">
                  <Star className="h-6 w-6" />
                </div>
              </div>
              
              <CardContent className="pt-8 p-8">
                <div className="flex justify-center mb-4 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-600 italic mb-4">
                  "My daughter's math grades improved from a C to an A- in just two months of tutoring. The personalized approach made all the difference!"
                </p>
                
                <div className="flex items-center justify-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full mr-3 flex items-center justify-center text-xs font-medium">JS</div>
                  <div>
                    <p className="font-medium text-gray-900">Jennifer S.</p>
                    <p className="text-gray-500 text-sm">Parent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Testimonial 2 */}
            <Card className="relative">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                <div className="w-12 h-12 rounded-full bg-yellow-100 border-4 border-white flex items-center justify-center text-yellow-600">
                  <Star className="h-6 w-6" />
                </div>
              </div>
              
              <CardContent className="pt-8 p-8">
                <div className="flex justify-center mb-4 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-600 italic mb-4">
                  "I was struggling with chemistry until I found my tutor through Tutor-Link. The interactive sessions and practice problems helped me ace my AP exam!"
                </p>
                
                <div className="flex items-center justify-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full mr-3 flex items-center justify-center text-xs font-medium">MB</div>
                  <div>
                    <p className="font-medium text-gray-900">Michael B.</p>
                    <p className="text-gray-500 text-sm">High School Student</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Testimonial 3 */}
            <Card className="relative">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                <div className="w-12 h-12 rounded-full bg-yellow-100 border-4 border-white flex items-center justify-center text-yellow-600">
                  <Star className="h-6 w-6" />
                </div>
              </div>
              
              <CardContent className="pt-8 p-8">
                <div className="flex justify-center mb-4 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-600 italic mb-4">
                  "As a working parent, the scheduling flexibility has been invaluable. My son connects with his tutor twice a week, and we can easily reschedule when needed."
                </p>
                
                <div className="flex items-center justify-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full mr-3 flex items-center justify-center text-xs font-medium">LT</div>
                  <div>
                    <p className="font-medium text-gray-900">Lisa T.</p>
                    <p className="text-gray-500 text-sm">Parent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Background with angled design */}
        <div className="absolute inset-0 bg-yellow-600 transform -skew-y-3"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Ready to transform your learning experience?
              </h2>
              <p className="mt-4 text-xl text-yellow-100">
                Join thousands of students who have improved their grades with Tutor-Link's personalized tutoring sessions.
              </p>
              
              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild variant="secondary" className="bg-white hover:bg-yellow-50 text-yellow-600">
                  <Link href="/auth/register">
                    Sign Up Free
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-white text-white hover:bg-white hover:text-yellow-600">
                  <Link href="/tutors">
                    Browse Tutors
                  </Link>
                </Button>
              </div>
              
              <div className="mt-8 flex items-center space-x-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-yellow-500 border-2 border-white flex items-center justify-center text-xs text-white font-medium ring-2 ring-yellow-600">
                      {i}
                    </div>
                  ))}
                </div>
                <p className="text-white text-sm">
                  <span className="font-bold">1,000+</span> students joined this month
                </p>
              </div>
            </div>
            
            <Card className="max-w-md">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Get started in minutes</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-bold text-sm mr-3">
                      1
                    </div>
                    <p className="text-gray-600">Create your free account</p>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-bold text-sm mr-3">
                      2
                    </div>
                    <p className="text-gray-600">Find a tutor that matches your needs</p>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-bold text-sm mr-3">
                      3
                    </div>
                    <p className="text-gray-600">Schedule your first session</p>
                  </div>
                </div>
                
                <Button asChild className="mt-6 bg-yellow-600 hover:bg-yellow-700 w-full">
                  <Link href="/auth/register">
                    Start Learning Now
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Tutor-Link</h3>
              <p className="text-gray-400">
                Connecting students with expert tutors for personalized learning experiences.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-400 hover:text-white">Home</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-white">About</Link></li>
                <li><Link href="/tutors" className="text-gray-400 hover:text-white">Find Tutors</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/cookies" className="text-gray-400 hover:text-white">Cookie Policy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2">
                <li className="text-gray-400">Email: info@tutor-link.com</li>
                <li className="text-gray-400">Phone: +1 (123) 456-7890</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Tutor-Link. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
