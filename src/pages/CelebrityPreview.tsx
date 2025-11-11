import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface PreviewData {
  name: string;
  profileSlug: string;
  dateOfBirth: string;
  profession: string;
  placeOfBirth?: string;
  mainContent: string;
  metaTitle: string;
  metaDescription: string;
  profileImageUrl: string;
}

const CelebrityPreview = () => {
  const navigate = useNavigate();
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem("celebrityPreview");
    if (data) {
      setPreviewData(JSON.parse(data));
    } else {
      // If no preview data, redirect back
      window.close();
    }
  }, []);

  if (!previewData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading preview...</p>
      </div>
    );
  }

  // Safely parse the date and check if it's valid
  const birthDate = previewData.dateOfBirth ? new Date(previewData.dateOfBirth) : null;
  const isValidDate = birthDate && !isNaN(birthDate.getTime());
  
  const age = isValidDate 
    ? Math.floor((new Date().getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Preview Banner */}
      <div className="bg-primary text-primary-foreground py-3 px-4 text-center">
        <p className="text-sm font-medium">
          Preview Mode - This is how the profile will look when published
        </p>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="bg-card rounded-lg shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="p-6 md:p-8 border-b border-border">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <img
                src={previewData.profileImageUrl}
                alt={previewData.name}
                className="w-32 h-32 md:w-48 md:h-48 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {previewData.name}
                </h1>
                <p className="text-lg text-muted-foreground mb-4">
                  {previewData.profession}
                </p>
                <div className="space-y-2 text-sm">
                  {isValidDate && age !== null && (
                    <>
                      <p className="text-foreground">
                        <span className="font-semibold">Age:</span> {age} years old
                      </p>
                      <p className="text-foreground">
                        <span className="font-semibold">Born:</span>{" "}
                        {format(birthDate!, "MMMM d, yyyy")}
                      </p>
                    </>
                  )}
                  {!isValidDate && (
                    <p className="text-muted-foreground italic">
                      Date of birth not set
                    </p>
                  )}
                  {previewData.placeOfBirth && (
                    <p className="text-foreground">
                      <span className="font-semibold">Birthplace:</span>{" "}
                      {previewData.placeOfBirth}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6 md:p-8">
            <div
              className="prose prose-slate dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: previewData.mainContent }}
            />
          </div>
        </div>

        {/* SEO Info (visible in preview) */}
        <div className="mt-8 p-6 bg-muted rounded-lg">
          <h2 className="text-lg font-semibold text-foreground mb-4">SEO Preview</h2>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-semibold">Meta Title:</span> {previewData.metaTitle}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Meta Description:</span>{" "}
              {previewData.metaDescription}
            </p>
            <p className="text-sm">
              <span className="font-semibold">URL:</span> /celebrity/
              {previewData.profileSlug}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CelebrityPreview;
