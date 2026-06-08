import { useEffect } from 'react';

export const SITE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL) ||
  'https://yadahomestay.com';
export const SITE_NAME = 'Yada Homestay | ญาดาโฮมสเตย์';
export const RESORT_PHONE = '081-234-5678';
export const RESORT_ADDRESS =
  '80 ธงชัย ต.ธงชัย อ.เมือง จ.เพชรบุรี 76000';

type SeoProps = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
};

const upsertMeta = (selector: string, attr: 'name' | 'property', key: string, content: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

const upsertLink = (rel: string, href: string) => {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
};

export function Seo({
  title,
  description,
  path = '/',
  image = '/images/hero-bg.jpg',
  noIndex = false,
  structuredData,
}: SeoProps) {
  useEffect(() => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const canonicalUrl = `${SITE_URL}${cleanPath}`;
    const imageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`;
    const fullTitle = title.includes('Yada') ? title : `${title} | Yada Homestay`;

    document.documentElement.lang = 'th';
    document.title = fullTitle;

    upsertMeta('meta[name="description"]', 'name', 'description', description);
    upsertMeta('meta[name="robots"]', 'name', 'robots', noIndex ? 'noindex,nofollow' : 'index,follow');
    upsertMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', description);
    upsertMeta('meta[property="og:type"]', 'property', 'og:type', 'website');
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    upsertMeta('meta[property="og:image"]', 'property', 'og:image', imageUrl);
    upsertMeta('meta[property="og:locale"]', 'property', 'og:locale', 'th_TH');
    upsertMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', imageUrl);
    upsertLink('canonical', canonicalUrl);

    const gscVerification = import.meta.env.VITE_GSC_VERIFICATION;
    if (gscVerification) {
      upsertMeta(
        'meta[name="google-site-verification"]',
        'name',
        'google-site-verification',
        gscVerification
      );
    }

    document.querySelectorAll('script[data-yada-seo="jsonld"]').forEach((node) => node.remove());
    if (structuredData) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.yadaSeo = 'jsonld';
      script.text = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  }, [description, image, noIndex, path, structuredData, title]);

  return null;
}

export const lodgingStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'LodgingBusiness',
  name: 'Yada Homestay',
  alternateName: 'ญาดาโฮมสเตย์',
  description:
    'โฮมสเตย์และที่พักในเพชรบุรี บรรยากาศสงบ ใกล้ธรรมชาติ พร้อมห้องพักสำหรับคู่รัก ครอบครัว และทริปพักผ่อน',
  url: SITE_URL,
  telephone: RESORT_PHONE,
  priceRange: '฿฿',
  image: [
    `${SITE_URL}/images/hero-bg.jpg`,
    `${SITE_URL}/images/room-villa.jpg`,
    `${SITE_URL}/images/gallery-garden.jpg`,
  ],
  address: {
    '@type': 'PostalAddress',
    streetAddress: '80 ธงชัย',
    addressLocality: 'เมืองเพชรบุรี',
    addressRegion: 'เพชรบุรี',
    postalCode: '76000',
    addressCountry: 'TH',
  },
  amenityFeature: [
    { '@type': 'LocationFeatureSpecification', name: 'WiFi', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'ที่จอดรถ', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'ห้องพักครอบครัว', value: true },
  ],
};

export const websiteStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: 'th-TH',
};

export const homeFaqStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Yada Homestay อยู่ที่ไหน',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ตั้งอยู่ที่ 80 ธงชัย ต.ธงชัย อ.เมือง จ.เพชรบุรี 76000 เหมาะสำหรับทริปพักผ่อนในเพชรบุรี',
      },
    },
    {
      '@type': 'Question',
      name: 'จองห้องพักออนไลน์ได้หรือไม่',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'สามารถเช็กห้องว่าง เลือกห้อง และส่งคำขอจองผ่านหน้าเว็บได้ทันที รวมถึงตรวจสอบสถานะการจองด้วยเบอร์โทร',
      },
    },
    {
      '@type': 'Question',
      name: 'เหมาะกับครอบครัวหรือคู่รักไหม',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'มีห้องหลายประเภท ทั้งห้องมาตรฐาน ห้องครอบครัว และพูลวิลล่า รองรับทั้งคู่รัก ครอบครัว และกลุ่มเพื่อน',
      },
    },
  ],
};

export function breadcrumbStructuredData(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.path.startsWith('http') ? item.path : `${SITE_URL}${item.path}`,
    })),
  };
}
