import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Camera, Share2, Sparkles, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { SEOHead } from "@/components/SEOHead";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SITE_CONFIG } from "@/lib/config";
import PageTransition from "@/components/PageTransition";
import { triggerNativeShare } from "@/lib/shareUtils";
import { SEOFaqSection } from "@/components/SEOFaqSection";

const AiFaceAge = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [estimatedAge, setEstimatedAge] = useState<number | null>(null);
  const [celebrities, setCelebrities] = useState<Array<{ name: string; profile_slug: string }>>([]);
  const [error, setError] = useState<string | null>(null);

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
        setEstimatedAge(null);
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

  const handleGuessAge = async () => {
    if (!uploadedImage || !uploadedFile) {
      toast.error('Please upload an image first');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setEstimatedAge(null);
    setCelebrities([]);

    try {
      console.log('Analyzing face age...');

      // Call the edge function
      const { data, error: functionError } = await supabase.functions.invoke(
        'estimate-face-age',
        {
          body: { imageUrl: uploadedImage }
        }
      );

      if (functionError) {
        console.error('Function error:', functionError);
        throw new Error('Failed to analyze your photo. Please try again.');
      }

      if (data.error) {
        setError(data.error);
        setIsAnalyzing(false);
        return;
      }

      if (!data.estimatedAge) {
        setError('Could not determine age from the photo. Please try a clearer image.');
        setIsAnalyzing(false);
        return;
      }

      console.log('Estimated age:', data.estimatedAge);
      setEstimatedAge(data.estimatedAge);
      toast.success('Age estimated!');

      // Fetch celebrities with the same age
      try {
        console.log('Fetching celebrities aged', data.estimatedAge);
        const { data: celebData, error: celebError } = await supabase.functions.invoke(
          'get-celebrities-by-age',
          {
            body: { target_age: data.estimatedAge }
          }
        );

        if (celebError) {
          console.error('Error fetching celebrities:', celebError);
        } else if (celebData?.celebrities && celebData.celebrities.length > 0) {
          console.log('Found celebrities:', celebData.celebrities);
          setCelebrities(celebData.celebrities);
        } else {
          console.log('No celebrities found for this age');
        }
      } catch (celebError) {
        console.error('Error fetching celebrities:', celebError);
        // Don't show error to user, just log it
      }

    } catch (error) {
      console.error('Error estimating age:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      toast.error('Failed to estimate age');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleShare = async () => {
    if (!estimatedAge) return;

    await triggerNativeShare({
      title: "AI Face Age Calculator",
      text: `The AI thinks I look ${estimatedAge} years old! Try it yourself.`,
      url: `${SITE_CONFIG.canonicalUrl}/ai-face-age`,
    });
  };

  return (
    <PageTransition>
    <>
      <SEOHead
        title="How Old Do I Look? AI Face Age Calculator & Face Check ID"
        description="Upload a photo and let our AI face age calculator estimate your age. Works as a face check ID and reverse face search tool. Free, fun, and accurate age detection from any photo."
        keywords="face check id, reverse face search, face age calculator, how old do i look, AI age detector, face age estimation, age from photo, age guesser"
        type="website"
      />

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Camera className="w-8 h-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                How Old Do I Look?
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload a photo of your face, and our AI (powered by Gemini Vision) will guess your age!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Upload Section */}
            <Card className="bg-card/50 backdrop-blur content-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  Upload Your Photo
                </CardTitle>
                <CardDescription>
                  Choose a clear photo with your face visible
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
                  onClick={handleGuessAge}
                  disabled={!uploadedImage || isAnalyzing || isCompressing}
                  className="w-full main-action-button"
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
                      Analyzing Your Face...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Guess My Age
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
            <Card className="bg-card/50 backdrop-blur content-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI Age Estimation
                </CardTitle>
                <CardDescription>
                  {estimatedAge ? 'Here\'s what the AI thinks!' : 'Upload a photo to see results'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {estimatedAge ? (
                  <div className="space-y-6 animate-fade-in">
                    <div className="text-center py-8">
                      <p className="text-lg text-muted-foreground mb-4">
                        AI thinks you look...
                      </p>
                      <div className="text-8xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-4">
                        {estimatedAge}
                      </div>
                      <p className="text-2xl text-muted-foreground">
                        years old
                      </p>
                    </div>

                    {/* Celebrity Context Area */}
                    {celebrities.length > 0 && (
                      <div className="bg-background/50 backdrop-blur rounded-lg p-6 border border-primary/20 animate-fade-in">
                        <p className="text-sm font-medium text-muted-foreground mb-3 text-center">
                          🌟 You share this age with:
                        </p>
                        <div className="space-y-2">
                          {celebrities.map((celeb, index) => (
                            <a
                              key={index}
                              href={`/people/${celeb.profile_slug}`}
                              className="block p-3 rounded-md bg-card/50 hover:bg-primary/10 transition-all duration-200 border border-transparent hover:border-primary/30 group"
                            >
                              <p className="text-foreground font-medium group-hover:text-primary transition-colors">
                                {celeb.name}
                              </p>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleShare}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share This Result!
                    </Button>

                    <div className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setUploadedImage(null);
                          setUploadedFile(null);
                          setEstimatedAge(null);
                          setCelebrities([]);
                        }}
                      >
                        Try Another Photo
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Upload your photo to discover your AI-estimated age!</p>
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
                  Upload a clear photo with your face visible
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <h4 className="font-semibold mb-2">AI Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Our AI analyzes facial features using advanced vision
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <h4 className="font-semibold mb-2">Get Results</h4>
                <p className="text-sm text-muted-foreground">
                  Discover your AI-estimated age instantly!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="mt-4 bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-xs text-center text-muted-foreground">
                <strong>Note:</strong> This is an AI-powered estimation tool for entertainment purposes. 
                Results may vary and should not be considered as accurate age verification. 
                The AI analyzes facial features, lighting, image quality, and other factors to make its best guess.
              </p>
            </CardContent>
          </Card>

          {/* SEO FAQ Section */}
          <SEOFaqSection
            title="AI Face Age Calculator & Face Check FAQ"
            description="Our AI face age calculator uses advanced computer vision to analyze facial features and estimate age from a photo. It also works as a face check ID tool, connecting your estimated age with celebrities of the same age."
            faqs={[
              {
                question: "How does the AI face age calculator work?",
                answer: "Our AI analyzes facial features like skin texture, facial structure, wrinkles, and other visual cues using Google's Gemini Vision AI. It then estimates your apparent age based on these features. The tool also performs a reverse face search to find celebrities who share your estimated age."
              },
              {
                question: "What is face check ID?",
                answer: "Face check ID refers to using facial analysis technology to identify or verify characteristics about a person from their photo. Our tool estimates your age and connects you with celebrities of the same age, creating a fun face check experience."
              },
              {
                question: "Can I use this as a reverse face search?",
                answer: "While our primary feature is age estimation, the tool also performs a type of reverse face search by finding celebrities who are the same estimated age as you. For celebrity look-alike matching, try our dedicated Look-Alike Finder tool."
              },
              {
                question: "How accurate is AI face age estimation?",
                answer: "AI face age estimation is typically accurate within 3-5 years for most people. Factors like lighting, makeup, photo quality, and facial expressions can affect accuracy. The AI works best with clear, front-facing photos in good lighting."
              },
              {
                question: "Is my photo stored or shared?",
                answer: "No, your photo is processed in real-time for age estimation and is not stored on our servers. Your privacy is our priority — the image is only used temporarily to generate the age estimate."
              }
            ]}
            relatedTools={[
              { name: "Celebrity Look-Alike Finder", path: "/look-alike-finder" },
              { name: "Age Calculator", path: "/" },
              { name: "Life Expectancy Calculator", path: "/life-expectancy-calculator" },
            ]}
          />
        </div>
      </div>
    </>
    </PageTransition>
  );
};

export default AiFaceAge;