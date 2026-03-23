import Link from "next/link";
import MetaTags from "../components/MetaTags";
import Footer from "../components/Footer";

export default function Privacy() {
  return (
    <div>
      <MetaTags title="Privacy Policy - winstall" path="/privacy" />
      <article>
        <section>
          <h2>Privacy Policy</h2>
            <p>Your privacy is important to us. winstall's policy is to respect your privacy regarding any information we may collect from you when using our app, and other sites we own and operate.</p>

            <p>We don’t collect or share any personally identifying information publicly or with third-parties. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorised access, disclosure, copying, use or modification. We only collect analytics data from the use of our app, and we will never collect any personal data.</p>

            <p>When you login to our app using Twitter, we do not collect or store any of your Twitter profile data. winstall only stores your Twitter user ID when you create/publish a "Pack". winstall will never collect your personal Twitter profile data.</p>

            <p>We collect analytics data by fair and lawful means, with your knowledge and consent. We use Google Analytics to track app analytics, and the analytics data collected is never shared with a third-party. The data is ONLY collected to track the app's usage metrics. Please refer to Google Analytics' privacy policy for more information.</p>

            <p>Our app may link to external sites that are not operated by us. Please be aware that we have no control over the content and practices of these sites, and cannot accept responsibility or liability for their respective privacy policies.</p>

            <p>Your continued use of our website and app will be regarded as acceptance of our practices around privacy. If you have any questions about how we handle user data feel free to contact us at products@builtbymeh.com.</p>

            <p>winstall is not associated with Microsoft, Windows, or Windows Package Manager.</p>
            <br/>
            <em>This policy is effective as of September 9, 2020.</em>
        </section>

      </article>
      <Footer/>
    </div>
  );
}
