export interface DemoQA {
    question: string;
    keywords: string[];
    answer: string;
    sources: string[];
}

export const DEMO_DOCUMENT_NAME = "HK_IT_Blueprint.pdf";

export const DEMO_QA: DemoQA[] = [
    {
        question: "What are the 4 broad development directions in the HK I&T Blueprint?",
        keywords: ["4 direction", "four direction", "development direction", "broad direction", "4個"],
        answer: `The Hong Kong Innovation & Technology Blueprint outlines **4 broad development directions**:

1. **New Industrialisation** — Advancing Hong Kong's re-industrialisation through smart manufacturing, attracting high-value-added industries (e.g., microelectronics, life & health technology), and strengthening the industrial ecosystem.

2. **Digital Economy** — Driving the digital transformation of traditional industries, promoting the wider adoption of fintech, and encouraging the development of the digital economy including Web 3.0 and the metaverse.

3. **Smart City** — Building a smarter, more liveable city by leveraging technology in public services, transport, healthcare, and urban management—anchored by the Smart City Blueprint 2.0.

4. **I&T Infrastructure** — Laying a solid foundation by expanding connectivity (5G, broadband), developing key research infrastructure (e.g., Hetao Shenzhen-Hong Kong Science and Technology Innovation Co-operation Zone), and nurturing I&T talent.

These directions work together to position Hong Kong as a global I&T hub.`,
        sources: [DEMO_DOCUMENT_NAME],
    },
    {
        question: "What is the role of InnoHK in the blueprint?",
        keywords: ["innohk", "innovation hub", "research cluster"],
        answer: `**InnoHK** is a flagship initiative that establishes world-class research clusters at the Hong Kong Science Park. Key highlights:

- It hosts **Research & Development Centres** collaborated with top global universities and institutions
- Two major clusters: **Health@InnoHK** (healthcare and life sciences) and **AIR@InnoHK** (AI and robotics)
- The blueprint calls for expanding InnoHK to attract more overseas talent and institutions
- It serves as a bridge connecting local universities, international research bodies, and the commercial sector

InnoHK embodies Hong Kong's strategy to become a **globally recognised centre for research and development**.`,
        sources: [DEMO_DOCUMENT_NAME],
    },
    {
        question: "How does the blueprint address talent development?",
        keywords: ["talent", "human capital", "education", "training", "workforce", "人才"],
        answer: `The Blueprint places **I&T talent development** as a top priority through multiple strategies:

- **STEM Education**: Strengthening STEM at primary and secondary levels, expanding coding education, and developing computational thinking.
- **University Collaboration**: Partnering with local and overseas universities to create I&T-focused programmes and research opportunities.
- **Attracting Overseas Talent**: Introducing favourable visa and immigration schemes (e.g., Top Talent Pass Scheme) to bring in global I&T professionals.
- **Reskilling & Upskilling**: Supporting existing workers in transitioning to I&T roles through vocational training and professional certifications.
- **Youth Programmes**: Engaging young people through coding competitions, hackathons, and internships with I&T companies.

The goal is to create a **deep and diverse pipeline of local I&T talent** while supplementing it with international expertise.`,
        sources: [DEMO_DOCUMENT_NAME],
    },
    {
        question: "What is the Hetao Shenzhen-Hong Kong Science and Technology Innovation Co-operation Zone?",
        keywords: ["hetao", "shenzhen", "co-operation zone", "innovation zone", "cross-border", "河套"],
        answer: `The **Hetao Shenzhen-Hong Kong Science and Technology Innovation Co-operation Zone** (河套深港科技創新合作區) is a major cross-boundary innovation hub straddling both sides of the Shenzhen River:

- **Hong Kong Park** (Lok Ma Chau Loop): Focuses on life & health technology, AI, data science, and new materials research.
- **Shenzhen Park**: Provides complementary industrial manufacturing and scaling capabilities.

**Strategic significance under the Blueprint**:
- Acts as a **key node** connecting Hong Kong's I&T ecosystem with the Greater Bay Area (GBA)
- Enables research conducted in Hong Kong to be rapidly translated into products across the border
- Provides a unique **"one zone, two parks"** model that leverages both cities' strengths
- Priority focus on "deep tech" research with commercialisation potential

It is one of the Blueprint's most important infrastructure investments for long-term I&T competitiveness.`,
        sources: [DEMO_DOCUMENT_NAME],
    },
    {
        question: "What does the blueprint say about fintech?",
        keywords: ["fintech", "financial technology", "digital payment", "virtual bank", "crypto", "web3"],
        answer: `The Blueprint identifies **fintech** as a core pillar of Hong Kong's digital economy strategy:

- **Regulatory sandbox & licensing**: The HKMA and SFC have created progressive frameworks for virtual banks, virtual insurers, and digital asset platforms.
- **Virtual Assets**: Hong Kong aims to become a global hub for **regulated virtual asset trading**, with a licensing regime for exchanges and openness to retail participation under appropriate safeguards.
- **Cross-boundary payments**: Expanding e-CNY pilots and cross-border payment interoperability with the Greater Bay Area.
- **Open banking**: Promoting data sharing and open APIs between financial institutions to spur innovation.
- **Green fintech**: Encouraging technology-driven sustainable finance solutions.

Hong Kong's position as Asia's leading **international financial centre** is seen as a unique advantage to build a thriving fintech ecosystem that complements—not competes with—traditional finance.`,
        sources: [DEMO_DOCUMENT_NAME],
    },
    {
        question: "What is the Smart City Blueprint and what areas does it cover?",
        keywords: ["smart city", "smart transport", "smart government", "smart living", "digital government"],
        answer: `The **Smart City Blueprint 2.0** is a government-wide strategy to use technology to improve urban living. It covers **6 major dimensions**:

1. **Smart Mobility** — Intelligent traffic management, EV infrastructure, autonomous vehicle R&D, real-time public transport data.
2. **Smart Living** — Digital health records, elderly care tech (AgeTech), smart home infrastructure.
3. **Smart Environment** — IoT-based waste and water management, air quality monitoring, carbon emissions tracking.
4. **Smart People** — Digital literacy programmes, e-inclusion for elderly and disadvantaged groups, STEM education.
5. **Smart Government** — Paperless government services, digital identity (iAM Smart), one-stop portal for public services.
6. **Smart Economy** — Fostering a supportive environment for I&T businesses, cross-sector digital transformation.

The Blueprint aligns Smart City goals with the broader I&T strategy to ensure technology genuinely improves the quality of life in Hong Kong.`,
        sources: [DEMO_DOCUMENT_NAME],
    },
    {
        question: "How does the blueprint support startups and the I&T ecosystem?",
        keywords: ["startup", "ecosystem", "incubator", "accelerator", "funding", "sme", "entrepreneurship"],
        answer: `The Blueprint outlines a comprehensive strategy to nurture a **thriving startup and I&T ecosystem**:

- **Funding Programs**: Expanding the Technology Voucher Programme (TVP), Enterprise Support Scheme (ESS), and R&D tax incentives to help companies invest in innovation.
- **Incubation & Acceleration**: Supporting HKSTP's incubation programmes, Cyberport's accelerator, and various university-run I&T incubators.
- **Government Procurement**: Committing to buy local I&T products and services, giving startups a reference customer and case studies.
- **Co-working Space**: Expanding subsidised space at Cyberport and HKSTP for early-stage companies.
- **Global Connectivity**: Facilitating Hong Kong startups' expansion into the GBA and ASEAN markets through government-backed overseas missions.
- **Family Offices & VC**: Creating a favourable environment for family offices and venture capital to invest in local I&T, including tax concessions.

The aim is to make Hong Kong an **Asia-Pacific startup hub** comparable to Singapore and Shenzhen.`,
        sources: [DEMO_DOCUMENT_NAME],
    },
    {
        question: "What are the key targets or KPIs mentioned in the blueprint?",
        keywords: ["target", "kpi", "goal", "metric", "indicator", "by 2030", "objective", "number"],
        answer: `The Blueprint sets several **ambitious targets** for Hong Kong's I&T development:

- **R&D Expenditure**: Increase R&D spending to **1.5% of GDP** (from the current ~1%), with the government committing to significantly raise its own R&D investment.
- **Tech Companies**: Attract **1,000+ additional technology companies** (including regional HQs) to set up in Hong Kong.
- **I&T Talent**: Train and attract tens of thousands of I&T professionals to address the talent shortage.
- **Smart City**: Roll out **5G** coverage across Hong Kong, expand government digital services to achieve full end-to-end digitisation.
- **New Industrialisation**: Attract projects worth billions of dollars in smart manufacturing investment. 
- **Hetao Zone**: Develop the Hong Kong Park of Hetao into a world-class research and innovation hub within the next several years.

These targets are monitored through an **annual I&T progress report** published by the Innovation, Technology and Industry Bureau (ITIB).`,
        sources: [DEMO_DOCUMENT_NAME],
    },
];

export const DEMO_SUGGESTED_QUESTIONS = [
    "What are the 4 broad development directions?",
    "How does the blueprint address talent development?",
    "What is the Hetao Co-operation Zone?",
    "What does the blueprint say about fintech?",
    "How does the blueprint support startups?",
];

export function findDemoAnswer(question: string): DemoQA | null {
    const q = question.toLowerCase();

    for (const qa of DEMO_QA) {
        for (const keyword of qa.keywords) {
            if (q.includes(keyword.toLowerCase())) {
                return qa;
            }
        }
    }

    // Fallback: partial word matching
    for (const qa of DEMO_QA) {
        const questionWords = q.split(/\s+/).filter((w) => w.length > 4);
        const matchCount = qa.keywords.filter((kw) =>
            questionWords.some((w) => kw.toLowerCase().includes(w) || w.includes(kw.toLowerCase()))
        ).length;
        if (matchCount > 0) return qa;
    }

    return null;
}
