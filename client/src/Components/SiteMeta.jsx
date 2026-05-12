import { Helmet } from "react-helmet-async";
import { useSiteSettings } from "../context/SiteSettingsContext";

export default function SiteMeta() {
  const { settings } = useSiteSettings();

  const title  = settings.meta_title_ar  || settings.company_name_ar || "الصرح للعقارات";
  const desc   = settings.meta_description_ar || "شركة عقارية رائدة في مجال التطوير العقاري";
  const logo   = settings.company_logo;
  const gaId   = settings.google_analytics_id;
  const fbId   = settings.facebook_pixel_id;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      {logo && <meta property="og:image" content={logo} />}
      {logo && <link rel="icon" type="image/png" href={logo} />}

      {/* Google Analytics */}
      {gaId && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
          <script>{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId}');`}</script>
        </>
      )}

      {/* Facebook Pixel */}
      {fbId && (
        <script>{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${fbId}');fbq('track','PageView');`}</script>
      )}
    </Helmet>
  );
}
