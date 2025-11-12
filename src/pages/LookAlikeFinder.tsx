import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Camera, Share2, Sparkles, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SITE_CONFIG } from "@/lib/config";
import PageTransition from "@/components/PageTransition";
import { triggerNativeShare } from "@/lib/shareUtils";

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

    await triggerNativeShare({
      title: "Celebrity Look-Alike Finder",
      text: `The AI says I look like ${matchResult.bestMatch.name}! Find your twin.`,
      url: `${SITE_CONFIG.canonicalUrl}/look-alike-finder`,
    });
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
        <div className="container mx-auto max-w-4xl">
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
                  Your Celebrity Match
                </CardTitle>
                <CardDescription>
                  {matchResult ? 'Here\'s your match!' : 'Upload a photo to see results'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {matchResult ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <img
                        src={matchResult.bestMatch.profileImageUrl}
                        alt={matchResult.bestMatch.name}
                        className="w-48 h-48 mx-auto rounded-full object-cover border-4 border-primary shadow-lg mb-4"
                      />
                      <h3 className="text-2xl font-bold text-foreground mb-2">
                        {matchResult.bestMatch.name}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {matchResult.bestMatch.profession}
                      </p>
                      <div className="inline-block bg-gradient-to-r from-primary to-purple-600 text-white px-6 py-3 rounded-full text-xl font-bold">
                        {matchResult.bestMatch.similarityPercentage}% Match
                      </div>
                    </div>

                    <Link to={`/people/${matchResult.bestMatch.profileSlug}`}>
                      <Button variant="outline" className="w-full">
                        View Full Profile
                      </Button>
                    </Link>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleShare}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Your Match!
                    </Button>

                    {matchResult.topMatches.length > 1 && (
                      <div className="mt-6 pt-6 border-t border-border">
                        <h4 className="font-semibold mb-3 text-sm text-muted-foreground">
                          Other Similar Matches:
                        </h4>
                        <div className="space-y-2">
                          {matchResult.topMatches.slice(1, 4).map((match) => (
                            <Link
                              key={match.id}
                              to={`/people/${match.profileSlug}`}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <img
                                src={match.profileImageUrl}
                                alt={match.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {match.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {match.profession}
                                </p>
                              </div>
                              <span className="text-sm font-semibold text-primary">
                                {match.similarityPercentage}%
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
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