import 'dotenv/config'
import { PrismaClient, PageCategory, BlockType } from '@prisma/client'
import * as pg from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('Missing DATABASE_URL for Prisma seed script')
}
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  // 1. Get or Create User
  let user = await prisma.user.findFirst()
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "demo@stickylynx.com",
        name: "Demo Admin",
      }
    })
    console.log("Created demo user:", user.id)
  } else {
    console.log("Using existing user:", user.id)
  }

  // Define image paths (local public paths)
  const auroraLogo = "/dummy/aurora_project_logo_1774391263637.png"
  const lunaProfile = "/dummy/luna_vante_profile_1774391286820.png"
  const lunaCover = "/dummy/luna_vante_cover_1774391301052.png"

  // 2. PROJECT PORTAL: Aurora Rebrand
  const auroraPage = await prisma.page.upsert({
    where: { handle: "aurora" },
    update: {},
    create: {
      userId: user.id,
      handle: "aurora",
      title: "The Aurora Rebrand",
      category: PageCategory.PROJECT_PORTAL,
      clientEmail: "client-test@example.com",
      isPublic: true,
      theme: { colorPrimary: "#7c3aed", clientName: "Aurora Labs" }
    }
  })
  
  // Clear existing blocks for this page to avoid duplicates
  await prisma.block.deleteMany({ where: { pageId: auroraPage.id } })

  const auroraBlocks = [
    {
      type: BlockType.PROJECT_HEADER,
      content: { 
        title: "The Aurora Rebrand", 
        clientName: "Luxe Cosmetics",
        logo: auroraLogo 
      },
      order: 0
    },
    {
      type: BlockType.STATUS_SUMMARY,
      content: { 
        text: "Moving into the Visual Identity phase. Brand guidelines are being refined based on last week's discovery workshop." 
      },
      order: 1
    },
    {
      type: BlockType.TIMELINE,
      content: { 
        currentStep: 2, 
        milestones: [
          { id: "1", label: "Discovery", tasks: [{ id: "t1", title: "Phase 0 Discovery Workshop", status: "done", stageId: "1", completionDate: new Date().toISOString(), comments: [] }] },
          { id: "2", label: "Strategy", tasks: [{ id: "t2", title: "Brand Narrative & Positioning", status: "done", stageId: "2", completionDate: new Date().toISOString(), comments: [] }] },
          { id: "3", label: "Visual ID", tasks: [
            { id: "t3", title: "Primary Logo Concept: Aurora Monogram", status: "review", description: "First round of primary concepts for the new Aurora logomark. Focus on iridescent glass textures and minimalist geometry.", stageId: "3", submission: { type: "image", value: auroraLogo }, comments: [{ id: "c1", author: "Stickylynx", text: "Please review the iridescent treatment on the 'A' mark.", timestamp: new Date().toLocaleString() }] },
            { id: "t4", title: "Color Palette & Texture Library", status: "todo", stageId: "3", comments: [] }
          ] },
          { id: "4", label: "Digital Assets", tasks: [] },
          { id: "5", label: "Deployment", tasks: [] }
        ] 
      },
      order: 2
    },
    {
      type: BlockType.DELIVERABLES,
      content: { 
        items: [
          { id: "d1", title: "Discovery Report", type: "file", description: "PDF summary of market research and audience personas." },
          { id: "d2", title: "Project Board", type: "url", value: "linear.app/aurora", description: "Live tracking of all brand assets." }
        ] 
      },
      order: 3
    }
  ]

  for (const b of auroraBlocks) {
    await prisma.block.create({
      data: {
        pageId: auroraPage.id,
        type: b.type,
        content: b.content,
        order: b.order
      }
    })
  }
  console.log("Seeded Aurora Project Portal")

  // 3. EPK: Luna Vante
  const lunaPage = await prisma.page.upsert({
    where: { handle: "lunavante" },
    update: {},
    create: {
      userId: user.id,
      handle: "lunavante",
      title: "Luna Vante",
      category: PageCategory.EPK,
      isPublic: true,
      theme: { colorPrimary: "#db2777" }
    }
  })

  // Clear existing blocks
  await prisma.block.deleteMany({ where: { pageId: lunaPage.id } })

  const epkBlocks = [
    {
      type: BlockType.TEXT,
      content: { 
        section: "hero", 
        artistName: "Luna Vante", 
        tagline: "Dream-pop landscapes for a neon generation.", 
        genre: "Experimental Synth-Pop", 
        profileImage: lunaProfile, 
        coverImage: lunaCover 
      },
      order: 0
    },
    {
      type: BlockType.LINK,
      content: { 
        items: [
          { id: "p1", platform: "spotify", url: "https://open.spotify.com/artist/lunavante" },
          { id: "p2", platform: "apple", url: "https://music.apple.com/artist/lunavante" },
          { id: "p3", platform: "youtube", url: "https://youtube.com/@lunavante" }
        ] 
      },
      order: 1
    },
    {
      type: BlockType.AUDIO,
      content: { 
        items: [
          { id: "a1", title: "Midnight City (Holographic Demo)", duration: "3:45", url: "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3" },
          { id: "a2", title: "Neon Dreams", duration: "4:02", url: "" }
        ] 
      },
      order: 2
    },
    {
      type: BlockType.VIDEO,
      content: { 
        items: [
          { id: "v1", title: "Neon Dreams (Official Music Video)", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }
        ] 
      },
      order: 4
    },
    {
      type: BlockType.IMAGE,
      content: { 
        items: [
          { id: "g1", src: lunaProfile, caption: "Press Photo 2024 - Berlin Session" },
          { id: "g2", src: lunaCover, caption: "Hologram World Tour Visuals" }
        ] 
      },
      order: 3
    },
    {
      type: BlockType.GRID,
      content: {
        highlights: [
          { id: "h1", title: "Featured on Pitchfork Best New Music", url: "https://pitchfork.com" },
          { id: "h2", title: "Sold out Show at Berghain (Kantreine)" }
        ],
        press: [
          { id: "pr1", title: "Searching for the Future of Pop", outlet: "The Guardian", date: "Jan 2025", url: "https://theguardian.com" }
        ],
        tours: [
          { id: "to1", venue: "Huxleys Neue Welt", city: "Berlin", country: "Germany", date: "2025-06-15", status: "upcoming", ticketUrl: "https://eventim.de" },
          { id: "to2", venue: "Electric Brixton", city: "London", country: "UK", date: "2025-06-20", status: "upcoming", ticketUrl: "https://ticketmaster.co.uk" }
        ]
      },
      order: 6
    },
    {
      type: BlockType.TEXT,
      content: { 
        section: "bio", 
        text: "Luna Vante is a multi-instrumentalist producer based in Berlin. Her sound blends the driving rhythms of 80s synthwave with the ethereal textures of modern dream-pop. After her debut EP 'Neon Dreams' went viral in the underground club scene, she has been hailed as one of the most promising voices in experimental pop.",
        pressKitUrl: "/dummy/press_kit.pdf" 
      },
      order: 5
    },
    {
      type: BlockType.CONTACT,
      content: { 
        email: "booking@lunavante.com", 
        managementName: "Stellar Records Management", 
        managementEmail: "management@stellar-records.com",
        socials: { instagram: "https://instagram.com/lunavante", twitter: "https://x.com/lunavante", tiktok: "https://tiktok.com/@lunavante" } 
      },
      order: 7
    }
  ]

  for (const b of epkBlocks) {
    await prisma.block.create({
      data: {
        pageId: lunaPage.id,
        type: b.type,
        content: b.content,
        order: b.order
      }
    })
  }
  console.log("Seeded Luna Vante EPK")
}

main().catch(console.error).finally(() => prisma.$disconnect())
