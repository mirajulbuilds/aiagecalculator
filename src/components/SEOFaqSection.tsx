import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "react-router-dom";

interface FaqItem {
  question: string;
  answer: string;
}

interface RelatedTool {
  name: string;
  path: string;
}

interface SEOFaqSectionProps {
  title: string;
  description: string;
  faqs: FaqItem[];
  relatedTools?: RelatedTool[];
  jsonLd?: boolean;
}

export const SEOFaqSection = ({ title, description, faqs, relatedTools, jsonLd = true }: SEOFaqSectionProps) => {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section className="mt-12 mb-8">
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
      
      <div className="bg-card/50 backdrop-blur rounded-2xl border border-border p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{title}</h2>
        <p className="text-muted-foreground mb-6 leading-relaxed">{description}</p>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`faq-${index}`}>
              <AccordionTrigger className="text-left text-base">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {relatedTools && relatedTools.length > 0 && (
          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="text-lg font-semibold text-foreground mb-3">Related Tools</h3>
            <div className="flex flex-wrap gap-2">
              {relatedTools.map((tool) => (
                <Link
                  key={tool.path}
                  to={tool.path}
                  className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors"
                >
                  {tool.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
