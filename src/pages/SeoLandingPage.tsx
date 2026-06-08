import { Link } from 'react-router-dom';
import { ArrowRight, BedDouble, CalendarCheck, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import SectionShell from '@/components/SectionShell';
import { Seo, lodgingStructuredData, SITE_URL } from '@/lib/seo';

type LandingConfig = {
  slug: string;
  title: string;
  description: string;
  heroImage: string;
  eyebrow: string;
  heading: string;
  intro: string;
  highlights: string[];
  faq: Array<{ question: string; answer: string }>;
};

const landingPages: Record<string, LandingConfig> = {
  'phetchaburi-homestay': {
    slug: 'phetchaburi-homestay',
    title: 'โฮมสเตย์เพชรบุรี บรรยากาศสงบ ใกล้ธรรมชาติ',
    description:
      'Yada Homestay ที่พักเพชรบุรีสไตล์โฮมสเตย์ เหมาะกับคู่รัก ครอบครัว และทริปพักผ่อน พร้อมห้องพักสะอาด บริการอบอุ่น และจองออนไลน์ได้',
    heroImage: '/images/hero-bg.jpg',
    eyebrow: 'Phetchaburi Homestay',
    heading: 'โฮมสเตย์เพชรบุรีที่พักง่าย อบอุ่น และได้พักจริง',
    intro:
      'สำหรับคนที่อยากพักใกล้ธรรมชาติแต่ยังต้องการความสะดวกสบาย Yada Homestay รวมบรรยากาศเงียบสงบ ห้องพักสะอาด และทีมดูแลที่เป็นกันเองไว้ในที่เดียว',
    highlights: ['เดินทางสะดวกในเมืองเพชรบุรี', 'มีห้องพักหลายขนาด', 'เหมาะกับครอบครัวและคู่รัก', 'เช็กห้องว่างและจองออนไลน์ได้'],
    faq: [
      {
        question: 'Yada Homestay อยู่ที่ไหน',
        answer: 'ตั้งอยู่ที่ 80 ธงชัย ต.ธงชัย อ.เมือง จ.เพชรบุรี 76000 เหมาะสำหรับทริปพักผ่อนในเพชรบุรี',
      },
      {
        question: 'เหมาะกับครอบครัวไหม',
        answer: 'เหมาะครับ มีห้องสำหรับหลายคน พื้นที่พักผ่อน และบรรยากาศเงียบสงบสำหรับครอบครัว',
      },
      {
        question: 'จองออนไลน์ได้หรือไม่',
        answer: 'สามารถเลือกห้องพัก ตรวจรายละเอียด และส่งคำขอจองผ่านหน้าเว็บได้ทันที',
      },
    ],
  },
  'family-room-phetchaburi': {
    slug: 'family-room-phetchaburi',
    title: 'ห้องพักครอบครัวเพชรบุรี พักสบายสำหรับหลายคน',
    description:
      'ห้องพักครอบครัวในเพชรบุรีที่ Yada Homestay พื้นที่กว้าง บรรยากาศเป็นส่วนตัว เหมาะกับทริปพ่อแม่ลูกหรือกลุ่มเพื่อน',
    heroImage: '/images/room-family.jpg',
    eyebrow: 'Family Stay',
    heading: 'ห้องพักครอบครัวที่ทุกคนมีพื้นที่ของตัวเอง',
    intro:
      'ทริปครอบครัวต้องการห้องที่จัดของง่าย นอนสบาย และไม่อึดอัด เราออกแบบประสบการณ์การจองให้ดูจำนวนคน ราคา และสิ่งอำนวยความสะดวกได้ชัดเจนก่อนตัดสินใจ',
    highlights: ['รองรับผู้เข้าพักหลายคน', 'เหมาะกับเด็กและผู้ใหญ่', 'พื้นที่กว้างกว่า standard room', 'ดูราคาและจองล่วงหน้าได้'],
    faq: [
      {
        question: 'ห้องครอบครัวพักได้กี่คน',
        answer: 'ขึ้นอยู่กับประเภทห้อง โดยสามารถดูจำนวนผู้เข้าพักสูงสุดในรายละเอียดห้องพักก่อนจอง',
      },
      {
        question: 'มีสิ่งอำนวยความสะดวกอะไรบ้าง',
        answer: 'มี WiFi เครื่องปรับอากาศ ทีวี น้ำอุ่น และสิ่งอำนวยความสะดวกตามประเภทห้อง',
      },
      {
        question: 'ควรจองล่วงหน้ากี่วัน',
        answer: 'แนะนำจองล่วงหน้า โดยเฉพาะวันหยุดและช่วงเทศกาล เพื่อให้ได้ห้องที่เหมาะกับจำนวนคน',
      },
    ],
  },
  'pool-villa-phetchaburi': {
    slug: 'pool-villa-phetchaburi',
    title: 'พูลวิลล่าเพชรบุรี พักเป็นส่วนตัวที่ Yada Homestay',
    description:
      'พูลวิลล่าเพชรบุรีสำหรับทริปพักผ่อนส่วนตัว บรรยากาศสงบ มีพื้นที่ใช้สอยและสิ่งอำนวยความสะดวกครบสำหรับวันพักจริง',
    heroImage: '/images/room-villa.jpg',
    eyebrow: 'Pool Villa',
    heading: 'พูลวิลล่าสำหรับวันที่อยากพักแบบไม่ต้องรีบ',
    intro:
      'พูลวิลล่าคือห้องที่เหมาะกับการพักผ่อนแบบเต็มวัน มีพื้นที่ส่วนตัวและบรรยากาศที่ทำให้ทริปสั้น ๆ รู้สึกพิเศษขึ้น',
    highlights: ['บรรยากาศเป็นส่วนตัว', 'เหมาะกับคู่รักหรือทริปพิเศษ', 'มีพื้นที่ใช้สอยมากขึ้น', 'จองตรงกับที่พักได้'],
    faq: [
      {
        question: 'พูลวิลล่าเหมาะกับใคร',
        answer: 'เหมาะกับคู่รัก ครอบครัวขนาดเล็ก หรือคนที่ต้องการพื้นที่พักผ่อนเป็นส่วนตัวกว่าเดิม',
      },
      {
        question: 'ราคาเริ่มต้นเท่าไร',
        answer: 'ราคาแสดงตามข้อมูลห้องพักปัจจุบันบนหน้าเว็บ และอาจเปลี่ยนตามช่วงวันเข้าพัก',
      },
      {
        question: 'ต้องชำระเงินอย่างไร',
        answer: 'สามารถส่งข้อมูลจองผ่านเว็บและแนบหลักฐานการชำระเงินตามขั้นตอนที่ระบบกำหนด',
      },
    ],
  },
  'nearby-attractions': {
    slug: 'nearby-attractions',
    title: 'ที่พักใกล้แหล่งเที่ยวเพชรบุรี วางทริปง่ายจาก Yada Homestay',
    description:
      'แนะนำที่พักเพชรบุรีสำหรับวางทริปเที่ยวเมืองเพชรบุรี พักสบาย เดินทางสะดวก เหมาะกับทริปสั้น ครอบครัว และคนอยากพักใกล้ธรรมชาติ',
    heroImage: '/images/gallery-garden.jpg',
    eyebrow: 'Nearby Attractions',
    heading: 'พักให้ใกล้จังหวะเที่ยวเพชรบุรีมากขึ้น',
    intro:
      'เลือกที่พักที่ทำให้ทริปไม่เหนื่อยเกินไป สำรวจเมืองเพชรบุรี แวะคาเฟ่ ชมธรรมชาติ แล้วกลับมาพักในบรรยากาศเงียบสงบได้ในวันเดียว',
    highlights: ['เหมาะกับทริป 2 วัน 1 คืน', 'เดินทางเข้าเมืองเพชรบุรีได้ง่าย', 'พักเงียบหลังวันเที่ยว', 'มีห้องหลายแบบสำหรับหลายสไตล์ทริป'],
    faq: [
      {
        question: 'Yada Homestay เหมาะเป็นฐานเที่ยวเพชรบุรีไหม',
        answer: 'เหมาะสำหรับคนที่ต้องการที่พักสงบ เดินทางสะดวก และอยากวางทริปเมืองเพชรบุรีแบบไม่เร่งรีบ',
      },
      {
        question: 'ควรเลือกห้องแบบไหนสำหรับทริปเที่ยว',
        answer: 'ถ้ามากับครอบครัวให้ดูห้องครอบครัว ถ้ามาพักผ่อนแบบส่วนตัวให้ดูพูลวิลล่าหรือห้องที่มีพื้นที่มากขึ้น',
      },
      {
        question: 'เช็กห้องว่างก่อนวางแผนได้ไหม',
        answer: 'เช็กวันเข้าพักและส่งคำขอจองผ่านหน้า booking ได้ เพื่อให้ทีมที่พักยืนยันห้องให้ก่อนเดินทาง',
      },
    ],
  },
};

const getPageStructuredData = (page: LandingConfig) => [
  lodgingStructuredData,
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'หน้าแรก',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: page.title,
        item: `${SITE_URL}/${page.slug}`,
      },
    ],
  },
];

export function getSeoLandingSlugs() {
  return Object.keys(landingPages);
}

export default function SeoLandingPage({ slug }: { slug: string }) {
  const page = landingPages[slug] || landingPages['phetchaburi-homestay'];

  return (
    <main className="min-h-screen bg-yada-sand pt-24 text-yada-text">
      <Seo
        title={page.title}
        description={page.description}
        path={`/${page.slug}`}
        image={page.heroImage}
        structuredData={getPageStructuredData(page)}
      />

      <section className="relative min-h-[72vh] overflow-hidden">
        <img
          src={page.heroImage}
          alt={page.heading}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-yada-dark/80 via-yada-dark/45 to-transparent" />
        <div className="grain-overlay absolute inset-0" />
        <div className="relative z-10 mx-auto flex min-h-[72vh] max-w-7xl flex-col justify-center px-4 py-24 sm:px-6 lg:px-8">
          <Link to="/" className="mb-8 inline-flex w-fit items-center gap-2 text-sm font-medium text-white/80 hover:text-white">
            <ArrowRight className="h-4 w-4 rotate-180" />
            กลับหน้าแรก
          </Link>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-yada-accent">
            {page.eyebrow}
          </p>
          <h1 className="font-display max-w-3xl text-4xl font-semibold leading-tight text-white md:text-6xl">
            {page.heading}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/88">
            {page.intro}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="yada" asChild className="px-7 py-6 text-base">
              <Link to="/booking">เช็กห้องว่าง</Link>
            </Button>
            <Button asChild variant="yada-outline" className="border-white bg-white/10 px-7 py-6 text-base text-white hover:bg-white hover:text-yada-text">
              <Link to="/rooms">ดูห้องพัก</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <SectionShell
          label="Why Stay Here"
          title="เหตุผลที่คนเลือกพักกับเรา"
          subtitle="เราวางข้อมูลสำคัญไว้ให้ตัดสินใจง่าย ตั้งแต่ประเภทห้อง ราคา ความจุ ไปจนถึงช่องทางติดต่อ เพื่อให้การจองใช้เวลาน้อยลงและมั่นใจมากขึ้น"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {page.highlights.map((highlight, index) => {
            const icons = [MapPin, BedDouble, Star, CalendarCheck];
            const Icon = icons[index % icons.length];
            return (
              <article
                key={highlight}
                className="rounded-xl border border-yada-accent/20 bg-yada-surface p-5 shadow-sm transition-shadow hover:shadow-yada"
              >
                <Icon className="mb-4 h-6 w-6 text-yada-primary" />
                <h3 className="font-semibold text-yada-text">{highlight}</h3>
              </article>
            );
          })}
        </div>
        </div>
      </section>

      <section className="bg-yada-sand py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <SectionShell
              label="FAQ"
              title="คำถามที่พบบ่อย"
              subtitle="คำตอบสั้นๆ ที่ช่วยให้ตัดสินใจก่อนจอง"
            />
          </div>
          <Accordion type="single" collapsible className="rounded-lg border border-yada-accent/20 bg-yada-surface">
            {page.faq.map((item, index) => (
              <AccordionItem key={item.question} value={`faq-${index}`} className="px-4">
                <AccordionTrigger className="text-left font-semibold text-yada-text hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="leading-relaxed text-yada-text-secondary">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </main>
  );
}
