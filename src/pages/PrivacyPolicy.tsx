import { Helmet } from "react-helmet-async";

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - aiagecalc.com</title>
        <meta 
          name="description" 
          content="Read our comprehensive privacy policy to understand how we collect, use, and protect your information when you use aiagecalc.com." 
        />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
            <section className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border/50">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to aiagecalc.com. This Privacy Policy explains how we collect, use, disclose, 
                and safeguard your information when you visit our website. Please read this privacy policy 
                carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
              </p>
            </section>

            <section className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border/50">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Consent</h2>
              <p className="text-muted-foreground leading-relaxed">
                By using our website, you hereby consent to our Privacy Policy and agree to its terms.
              </p>
            </section>

            <section className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border/50">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Information We Collect</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">Log Files</h3>
              <p className="text-muted-foreground leading-relaxed">
                aiagecalc.com follows a standard procedure of using log files. These files log visitors when 
                they visit websites. All hosting companies do this as part of hosting services' analytics. The 
                information collected by log files includes internet protocol (IP) addresses, browser type, 
                Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the 
                number of clicks. These are not linked to any information that is personally identifiable. The 
                purpose of the information is for analyzing trends, administering the site, tracking users' 
                movement on the website, and gathering demographic information.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">Cookies and Web Beacons</h3>
              <p className="text-muted-foreground leading-relaxed">
                Like any other website, aiagecalc.com uses "cookies". These cookies are used to store 
                information including visitors' preferences, and the pages on the website that the visitor 
                accessed or visited. The information is used to optimize the users' experience by customizing 
                our web page content based on visitors' browser type and/or other information.
              </p>
            </section>

            <section className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border/50">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Google DoubleClick DART Cookie</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Google is one of the third-party vendors on our site. It also uses cookies, known as DART 
                cookies, to serve ads to our site visitors based upon their visit to aiagecalc.com and other 
                sites on the internet. However, visitors may choose to decline the use of DART cookies by 
                visiting the Google ad and content network Privacy Policy at the following URL:
              </p>
              <a 
                href="https://policies.google.com/technologies/ads" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                https://policies.google.com/technologies/ads
              </a>
            </section>

            <section className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border/50">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Our Advertising Partners</h2>
              <p className="text-muted-foreground leading-relaxed">
                Some of advertisers on our site may use cookies and web beacons. Our advertising partners 
                include Google AdSense. Each of our advertising partners has their own Privacy Policy for 
                their policies on user data. For easier access, we have linked to their Privacy Policies above.
              </p>
            </section>

            <section className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border/50">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">AI Tools and User Data</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                When you use our tools and services on aiagecalc.com:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  <strong>Age Calculator:</strong> Date of birth information you provide is processed 
                  in your browser to calculate age results. This data is not transmitted to our servers 
                  or stored long-term.
                </li>
                <li>
                  <strong>AI Greeting Generator:</strong> Any prompts or data you provide for AI-generated 
                  content are processed to deliver the requested service and are not stored permanently 
                  on our servers.
                </li>
                <li>
                  <strong>General Processing:</strong> User-provided data for any tool is processed solely 
                  to provide the requested service and is immediately discarded after processing. We do not 
                  maintain long-term records of personal calculation data.
                </li>
              </ul>
            </section>

            <section className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border/50">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Third-Party Privacy Policies</h2>
              <p className="text-muted-foreground leading-relaxed">
                aiagecalc.com's Privacy Policy does not apply to other advertisers or websites. Thus, we 
                are advising you to consult the respective Privacy Policies of these third-party ad servers 
                for more detailed information. It may include their practices and instructions about how to 
                opt-out of certain options.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                You can choose to disable cookies through your individual browser options. To know more 
                detailed information about cookie management with specific web browsers, it can be found 
                at the browsers' respective websites.
              </p>
            </section>

            <section className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border/50">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">CCPA and GDPR Privacy Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Under the CCPA (California Consumer Privacy Act) and GDPR (General Data Protection Regulation), 
                users have the following rights:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>The right to request access to the personal data we have about you</li>
                <li>The right to request that we correct any inaccurate personal data</li>
                <li>The right to request that we delete your personal data</li>
                <li>The right to object to processing of your personal data</li>
                <li>The right to request that we restrict the processing of your personal data</li>
                <li>The right to data portability</li>
                <li>The right to withdraw consent at any time</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                If you make a request, we have one month to respond to you. If you would like to exercise 
                any of these rights, please contact us using the information provided below.
              </p>
            </section>

            <section className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border/50">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Children's Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                Another part of our priority is adding protection for children while using the internet. 
                We encourage parents and guardians to observe, participate in, and/or monitor and guide 
                their online activity.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                aiagecalc.com does not knowingly collect any Personal Identifiable Information from children 
                under the age of 13. If you think that your child provided this kind of information on our 
                website, we strongly encourage you to contact us immediately and we will do our best efforts 
                to promptly remove such information from our records.
              </p>
            </section>

            <section className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border/50">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions or concerns about our Privacy Policy, the data we hold about you, 
                or you would like to exercise one of your data protection rights, please do not hesitate to 
                contact us.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                <strong>Email:</strong>{" "}
                <a 
                  href="mailto:privacy@aiagecalc.com" 
                  className="text-primary hover:underline"
                >
                  privacy@aiagecalc.com
                </a>
              </p>
            </section>

            <section className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border/50">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes by 
                posting the new Privacy Policy on this page and updating the "Last Updated" date below.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                You are advised to review this Privacy Policy periodically for any changes. Changes to this 
                Privacy Policy are effective when they are posted on this page.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-6 italic">
                <strong>Last Updated:</strong> January 2025
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
