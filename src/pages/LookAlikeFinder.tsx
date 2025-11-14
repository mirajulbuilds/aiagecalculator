import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Camera, Share2, Sparkles, AlertCircle, RotateCcw, History, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SITE_CONFIG } from "@/lib/config";
import PageTransition from "@/components/PageTransition";
import { triggerNativeShare } from "@/lib/shareUtils";
import { useMatchHistory } from "@/hooks/useMatchHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CelebrityMatch {
  id: string;
  name: string;
  profileSlug: string;
  profileImageUrl: string;
  profession: string;
  similarity: number;
  similarityPercentage: number;
}

interface MatchResult {
  bestMatch: CelebrityMatch;
  topMatches: CelebrityMatch[];
  totalCompared: number;
}

const LookAlikeFinder = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const { history, addToHistory, removeFromHistory, clearHistory } = useMatchHistory();

  // Client-side image compression utility
  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          // Create canvas for resizing
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          // Calculate new dimensions (max width 1920px, maintain aspect ratio)
          const maxWidth = 1920;
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          // Set canvas dimensions
          canvas.width = width;
          canvas.height = height;

          // Draw resized image
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to JPEG blob at 0.8 quality
          canvas.toBlob(
            (blob) => {
              if (blob) {
                // Create a new File from the blob
                const compressedFile = new File([blob], file.name.replace(/\.\w+$/, '.jpg'), {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                console.log(`Compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
                resolve(compressedFile);
              } else {
                reject(new Error('Failed to compress image'));
              }
            },
            'image/jpeg',
            0.8
          );
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a JPG, JPEG, or PNG image');
      return;
    }

    try {
      setIsCompressing(true);
      let finalFile = file;

      // Check if compression is needed (files > 4.5MB)
      const compressionThreshold = 4.5 * 1024 * 1024; // 4.5MB
      if (file.size > compressionThreshold) {
        toast.info('Optimizing your image...');
        finalFile = await compressImage(file);
        toast.success('Image optimized successfully!');
      }

      // Final validation after compression
      if (finalFile.size > 5 * 1024 * 1024) {
        toast.error('Image is still too large after compression. Please try a smaller image.');
        setIsCompressing(false);
        return;
      }

      setUploadedFile(finalFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setMatchResult(null);
        setError(null);
        setIsCompressing(false);
      };
      reader.readAsDataURL(finalFile);
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image. Please try again.');
      setIsCompressing(false);
    }
  };

  const handleFindMatch = async () => {
    if (!uploadedImage || !uploadedFile) {
      toast.error('Please upload an image first');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setMatchResult(null);

    try {
      console.log('Step 1: Generating face embedding from uploaded image...');

      // Step 1: Generate face embedding from uploaded image
      const { data: embeddingData, error: embeddingError } = await supabase.functions.invoke(
        'generate-face-embedding',
        {
          body: { imageUrl: uploadedImage }
        }
      );

      if (embeddingError) {
        console.error('Embedding generation error:', embeddingError);
        throw new Error('Failed to analyze your photo. Please try again.');
      }

      if (!embeddingData.faceDetected) {
        setError('No clear face detected in your photo. Please try another image with a clear, front-facing portrait.');
        setIsAnalyzing(false);
        return;
      }

      if (!embeddingData.embedding || embeddingData.confidence < 0.5) {
        setError('Could not clearly analyze facial features. Please try a clearer photo.');
        setIsAnalyzing(false);
        return;
      }

      console.log('Step 2: Finding celebrity matches...');

      // Step 2: Find matching celebrity
      const { data: matchData, error: matchError } = await supabase.functions.invoke(
        'find-celebrity-match',
        {
          body: { userEmbedding: embeddingData.embedding }
        }
      );

      if (matchError) {
        console.error('Match finding error:', matchError);
        throw new Error('Failed to find celebrity matches. Please try again.');
      }

      if (matchError?.message?.includes('No celebrities with face embeddings')) {
        setError('Our celebrity database is being updated with facial recognition data. Please check back soon!');
        setIsAnalyzing(false);
        return;
      }

      if (!matchData.bestMatch) {
        setError('Could not find any celebrity matches. Our database is still growing!');
        setIsAnalyzing(false);
        return;
      }

      console.log('Match found:', matchData);
      setMatchResult(matchData);
      
      // Add to history
      if (uploadedImage && matchData.topMatches && matchData.topMatches.length > 0) {
        addToHistory({
          imageUrl: uploadedImage,
          topMatch: {
            name: matchData.topMatches[0].name,
            profileSlug: matchData.topMatches[0].profileSlug,
            profileImageUrl: matchData.topMatches[0].profileImageUrl,
            similarityPercentage: matchData.topMatches[0].similarityPercentage,
            profession: matchData.topMatches[0].profession,
          },
          topThree: matchData.topMatches.slice(0, 3).map(match => ({
            name: match.name,
            profileSlug: match.profileSlug,
            similarityPercentage: match.similarityPercentage,
          })),
        });
      }
      
      toast.success('Match found!');

    } catch (error) {
      console.error('Error finding match:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      toast.error('Failed to find your celebrity match');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleShare = async () => {
    if (!matchResult) return;

    const topMatch = matchResult.topMatches[0] || matchResult.bestMatch;
    await triggerNativeShare({
      title: "Celebrity Look-Alike Finder",
      text: `The AI says my #1 celebrity twin is ${topMatch.name}! Find yours.`,
      url: `${SITE_CONFIG.canonicalUrl}/look-alike-finder`,
    });
  };

  const handleReset = () => {
    setUploadedImage(null);
    setUploadedFile(null);
    setMatchResult(null);
    setError(null);
    toast.success('Ready for a new photo!');
  };

  return (
    <PageTransition>
    <>
      <Helmet>
        <title>Find Your Celebrity Look-Alike | AI Face Match Tool</title>
        <meta name="description" content="Upload your photo and discover which celebrity you look like! Our AI-powered face matching technology compares your features with thousands of celebrities." />
        <meta name="keywords" content="celebrity look-alike, face match, AI face recognition, celebrity twin, who do I look like" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Find Your Celebrity Look-Alike
              </h1>
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload your photo and our advanced AI will find which celebrity from our database you resemble the most!
            </p>
          </div>

          <Tabs defaultValue="finder" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="finder">Find Match</TabsTrigger>
              <TabsTrigger value="history">
                <History className="w-4 h-4 mr-2" />
                History ({history.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="finder">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Upload Section */}
            <Card className="bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-primary" />
                  Upload Your Photo
                </CardTitle>
                <CardDescription>
                  Choose a clear, front-facing photo for best results
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    {uploadedImage ? (
                      <img
                        src={uploadedImage}
                        alt="Uploaded"
                        className="max-h-64 mx-auto rounded-lg object-cover"
                      />
                    ) : (
                      <>
                        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          JPG, JPEG, or PNG (auto-optimized if needed)
                        </p>
                      </>
                    )}
                  </label>
                </div>

                <Button
                  onClick={handleFindMatch}
                  disabled={!uploadedImage || isAnalyzing || isCompressing}
                  className="w-full"
                  size="lg"
                >
                  {isCompressing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Optimizing Image...
                    </>
                  ) : isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Analyzing Your Photo...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Find My Match
                    </>
                  )}
                </Button>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card className="bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Your Top 3 Matches
                </CardTitle>
                <CardDescription>
                  {matchResult ? 'Here are your top celebrity matches!' : 'Upload a photo to see results'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {matchResult ? (
                  <div className="space-y-6">
                    <h3 className="text-center text-xl font-semibold mb-4">
                      Here are your Top 3 Matches!
                    </h3>
                    
                    {/* Top 3 Matches Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {matchResult.topMatches.slice(0, 3).map((match, index) => (
                        <Link
                          key={match.id}
                          to={`/people/${match.profileSlug}`}
                          className="group"
                        >
                          <Card className="h-full hover:shadow-xl hover:border-primary/50 transition-all duration-300 cursor-pointer overflow-hidden">
                            <CardContent className="p-4 text-center">
                              <div className="relative mb-3">
                                {index === 0 && (
                                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                                    #1
                                  </div>
                                )}
                                <img
                                  src={match.profileImageUrl}
                                  alt={match.name}
                                  className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-primary/20 group-hover:border-primary transition-colors"
                                />
                              </div>
                              <h4 className="font-bold text-foreground mb-1 truncate">
                                {match.name}
                              </h4>
                              <p className="text-xs text-muted-foreground mb-3 truncate">
                                {match.profession}
                              </p>
                              <div className="inline-block bg-gradient-to-r from-primary to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                                {match.similarityPercentage}% Match
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handleShare}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Your #1 Match!
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleReset}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Try Another Photo
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Upload your photo to discover your celebrity twin!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="space-y-6">
                {history.length === 0 ? (
                  <Card className="bg-card/50 backdrop-blur">
                    <CardContent className="py-12 text-center">
                      <History className="w-16 h-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
                      <p className="text-muted-foreground mb-2">No match history yet</p>
                      <p className="text-sm text-muted-foreground">
                        Your last 5 celebrity matches will appear here
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold">Your Match History</h2>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearHistory}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear All
                      </Button>
                    </div>
                    
                    <div className="grid gap-4">
                      {history.map((item) => (
                        <Card key={item.id} className="bg-card/50 backdrop-blur">
                          <CardContent className="p-6">
                            <div className="grid md:grid-cols-2 gap-6">
                              {/* User Photo */}
                              <div>
                                <p className="text-sm text-muted-foreground mb-3">
                                  {new Date(item.timestamp).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit'
                                  })}
                                </p>
                                <img
                                  src={item.imageUrl}
                                  alt="Your photo"
                                  className="w-full h-48 rounded-lg object-cover border-2 border-border"
                                />
                              </div>

                              {/* Match Results */}
                              <div>
                                <h3 className="font-semibold mb-4">Top Match</h3>
                                <Link
                                  to={`/people/${item.topMatch.profileSlug}`}
                                  className="block group"
                                >
                                  <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                    <img
                                      src={item.topMatch.profileImageUrl}
                                      alt={item.topMatch.name}
                                      className="w-20 h-20 rounded-full object-cover border-2 border-primary"
                                    />
                                    <div className="flex-1">
                                      <h4 className="font-bold group-hover:text-primary transition-colors">
                                        {item.topMatch.name}
                                      </h4>
                                      <p className="text-sm text-muted-foreground">
                                        {item.topMatch.profession}
                                      </p>
                                      <div className="mt-2 inline-block bg-gradient-to-r from-primary to-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                                        {item.topMatch.similarityPercentage}% Match
                                      </div>
                                    </div>
                                  </div>
                                </Link>

                                {item.topThree.length > 1 && (
                                  <div className="mt-4 pt-4 border-t border-border">
                                    <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
                                      Other matches:
                                    </h4>
                                    <div className="space-y-1">
                                      {item.topThree.slice(1).map((match, idx) => (
                                        <Link
                                          key={idx}
                                          to={`/people/${match.profileSlug}`}
                                          className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors text-sm"
                                        >
                                          <span className="font-medium">{match.name}</span>
                                          <span className="text-primary font-semibold">
                                            {match.similarityPercentage}%
                                          </span>
                                        </Link>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFromHistory(item.id)}
                                  className="w-full mt-4"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Remove from History
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* How It Works */}
          <Card className="mt-8 bg-gradient-to-br from-primary/5 to-purple-600/5">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <h4 className="font-semibold mb-2">Upload Photo</h4>
                <p className="text-sm text-muted-foreground">
                  Upload a clear photo of your face
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <h4 className="font-semibold mb-2">AI Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Our AI analyzes your facial features
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <h4 className="font-semibold mb-2">Find Match</h4>
                <p className="text-sm text-muted-foreground">
                  Discover your celebrity look-alike!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
    </PageTransition>
  );
};

export default LookAlikeFinder;