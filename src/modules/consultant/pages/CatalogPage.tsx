import { useState, useMemo } from 'react';
import { useGetAllCoursesQuery, useGetEnrolledCoursesQuery, useEnrollInCourseMutation, TrainingTrack } from '@/shared/store/coursesApi';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/Input';
import { Badge } from '@/shared/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Search as SearchIcon } from 'lucide-react';

export default function CatalogPage() {
  const { data: catalogData, isLoading: isLoadingCatalog, refetch: refetchCatalog } = useGetAllCoursesQuery();
  const { data: enrolledTracks = [], isLoading: isLoadingEnrolled } = useGetEnrolledCoursesQuery();
  const [enrollInCourse, { isLoading: isEnrolling }] = useEnrollInCourseMutation();

  const [searchQuery, setSearchQuery] = useState('');

  const enrolledIds = useMemo(() => {
    return new Set(enrolledTracks.map(t => t.id));
  }, [enrolledTracks]);

  const handleEnroll = async (trackId: string) => {
    try {
      await enrollInCourse(trackId).unwrap();
      toast.success('Successfully enrolled!');
      // Refresh or redirect
      refetchCatalog();
      // Optional: navigate('/courses');
    } catch (error: any) {
      if (error?.status === 400) {
        toast.error('You are already enrolled in this track via your job title.');
      } else {
        toast.error('Failed to enroll. Please try again.');
      }
    }
  };

  const tracks = catalogData?.results || [];

  const filteredTracks = useMemo(() => {
    return tracks.filter((t: TrainingTrack) => 
      t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.platform?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tracks, searchQuery]);

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Course Catalog</h1>
          <p className="text-muted-foreground mt-1">Discover and self-enroll in new training paths.</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by title, platform or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </div>

      {isLoadingCatalog || isLoadingEnrolled ? (
        <div className="flex flex-col items-center justify-center p-24 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading catalog...</p>
        </div>
      ) : filteredTracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-card text-muted-foreground">
          <p className="text-lg font-medium">No training tracks found.</p>
          <p className="text-sm">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTracks.map((track: TrainingTrack) => {
            const isEnrolled = enrolledIds.has(track.id);

            return (
              <Card key={track.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="font-semibold">
                      {track.platform || 'General'}
                    </Badge>
                    {track.category && (
                      <Badge variant="outline" className="text-xs">
                        {track.category}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl line-clamp-1">{track.title}</CardTitle>
                  <CardDescription className="line-clamp-2 h-10">
                    {track.description || 'Enhance your professional skills with this specialized training track.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow pt-2">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Total Courses:</span>
                      <span className="font-medium text-foreground">{track.total_courses || track.courses?.length || 0}</span>
                    </div>
                    {track.duration && (
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Duration:</span>
                        <span className="font-medium text-foreground">{track.duration}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t mt-auto">
                  {isEnrolled ? (
                    <Button variant="outline" className="w-full" disabled>
                      Enrolled
                    </Button>
                  ) : (
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90" 
                      onClick={() => handleEnroll(track.id)}
                      disabled={isEnrolling}
                    >
                      {isEnrolling ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enrolling...
                        </>
                      ) : (
                        'Enroll Now'
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
