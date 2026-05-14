import { Link } from "react-router-dom";
import { Building2, Phone, Mail, MapPin, Facebook, Instagram, Youtube } from "lucide-react";
import { useSiteSettings } from "../../context/SiteSettingsContext";

export default function Footer() {
  const year = new Date().getFullYear();
  const { settings, contact } = useSiteSettings();

  const phone   = contact.phone    || settings.company_phone   || "01234567890";
  const email   = contact.email    || settings.company_email   || "info@elsarh.com";
  const address = contact.address_ar || settings.company_address || "القاهرة، مصر";
  const logo    = settings.company_logo;
  const name    = settings.company_name_ar || "الصرح للعقارات";

  const facebook  = contact.facebook  || settings.facebook_url  || "#";
  const instagram = contact.instagram || settings.instagram_url || "#";
  const youtube   = contact.youtube   || settings.youtube_url   || "#";

  return (
    <footer className="bg-[#1f2937] text-white" dir="rtl">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              {logo ? (
                <img src={logo} alt={name} className="h-10 w-auto object-contain" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-[#2d5d89] flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
              )}
              <span className="font-bold text-lg">{name}</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              شركة عقارية رائدة متخصصة في توفير أفضل الوحدات السكنية والتجارية بأعلى معايير الجودة.
            </p>
            <div className="flex items-center gap-3 mt-4">
              {facebook !== "#" || true ? (
                <a href={facebook || "#"} target="_blank" rel="noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#2d5d89] flex items-center justify-center transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
              ) : null}
              <a href={instagram || "#"} target="_blank" rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#2d5d89] flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href={youtube || "#"} target="_blank" rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#2d5d89] flex items-center justify-center transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-sm mb-4 text-gray-200 uppercase tracking-wide">روابط سريعة</h3>
            <ul className="space-y-2.5">
              {[
                { to: "/projects", label: "مشاريعنا" },
                { to: "/units",    label: "الوحدات المتاحة" },
                { to: "/about",    label: "عن الشركة" },
                { to: "/blog",     label: "الأخبار والمقالات" },
                { to: "/careers",  label: "الوظائف" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-sm mb-4 text-gray-200 uppercase tracking-wide">تواصل معنا</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5 text-gray-400 text-sm">
                <Phone className="w-4 h-4 flex-shrink-0 text-[#f59e0b]" />
                <a href={`tel:+2${phone}`} className="hover:text-white transition-colors">{phone}</a>
              </li>
              <li className="flex items-center gap-2.5 text-gray-400 text-sm">
                <Mail className="w-4 h-4 flex-shrink-0 text-[#f59e0b]" />
                <a href={`mailto:${email}`} className="hover:text-white transition-colors">{email}</a>
              </li>
              <li className="flex items-start gap-2.5 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#f59e0b]" />
                <span>{address}</span>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div>
            <h3 className="font-bold text-sm mb-4 text-gray-200 uppercase tracking-wide">احجز استشارتك</h3>
            <p className="text-gray-400 text-sm mb-4">تواصل معنا الآن للحصول على أفضل العروض العقارية</p>
            <Link to="/contact"
              className="inline-flex items-center justify-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors w-full">
              تواصل الآن
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-sm">© {year} {name}. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-4">
            <Link to="/contact" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">سياسة الخصوصية</Link>
            <Link to="/admin" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">لوحة الإدارة</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
