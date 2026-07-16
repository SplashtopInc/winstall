import Link from "next/link";
import MetaTags from "../components/MetaTags";
import Footer from "../components/Footer";

export default function Privacy() {
  return (
    <div>
      <MetaTags title="Winstall Privacy Policy | winstall" path="/privacy" desc="Read the winstall privacy policy, including how analytics data is handled and what information is stored for packs." />
      <article>
        <section>
          <h2>Privacy Policy</h2>
            <p>Your privacy is important to us. winstall's policy is to respect your privacy regarding any information we may collect from you when using our app, and other sites we own and operate.</p>

            <p>We don't share any personally identifying information publicly or with third-parties. What data we store, we'll protect within commercially acceptable means to prevent loss and theft, as well as unauthorised access, disclosure, copying, use or modification.</p>

            <p>If you sign in with Google, GitHub, or Microsoft, we get your name, email address, and profile picture from that account so we know who you are. We never see or store your password — that stays with whichever provider you signed in with.</p>

            <p>Signing in lets you create App Packs: named lists of apps you can save and come back to later. Packs are private by default. If you share a pack's link or make it public, its name, apps, and description become visible to anyone with the link, or anyone browsing Public Packs — so don't put anything personal in a pack's name or description if you're going to share it.</p>

            <p>You can delete your account any time from the profile menu. This wipes your name, email, avatar, and every App Pack you've made, right away — nothing is kept afterward.</p>

            <p>We collect analytics data by fair and lawful means, with your knowledge and consent. We use Google Analytics to track app analytics, and the analytics data collected is never shared with a third-party. The data is ONLY collected to track the app's usage metrics. Please refer to Google Analytics' privacy policy for more information.</p>

            <p>Our app may link to external sites that are not operated by us, including Google, GitHub, and Microsoft if you sign in through them. Please be aware that we have no control over the content and practices of these sites, and cannot accept responsibility or liability for their respective privacy policies.</p>

            <p>Your continued use of our website and app will be regarded as acceptance of our practices around privacy. If you have any questions about how we handle user data feel free to contact us at privacy@splashtop.com.</p>

            <p>winstall is not associated with Microsoft, Windows, Windows Package Manager, Google, or GitHub.</p>
            <br/>
            <em>This policy is effective as of July 12, 2026.</em>
        </section>

      </article>
      <Footer/>
    </div>
  );
}
