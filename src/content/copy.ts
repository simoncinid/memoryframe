export const copy = {
  brand: {
    name: "MemoryFrame",
    tagline: "Create meaningful family portraits with AI",
    domain: "memoryframe.art",
  },

  home: {
    hero: {
      headline: "Bring Your Family Together in One Portrait",
      subheadline: "Upload two photos and a background. Choose a style. Get a beautiful family portrait in seconds.",
      ctaPrimary: "Create a Portrait",
      ctaSecondary: "See Examples",
    },
    howItWorks: {
      title: "How It Works",
      subtitle: "Three simple steps to your perfect family portrait",
      steps: [
        {
          number: "1",
          title: "Upload Photos",
          description: "Add photos of two people and choose a background scene.",
        },
        {
          number: "2",
          title: "Pick a Style",
          description: "Select from classic, painterly, cinematic, and more artistic styles.",
        },
        {
          number: "3",
          title: "Generate & Download",
          description: "Get your portrait in seconds. Download in high quality.",
        },
      ],
    },
    gallery: {
      title: "Gallery",
      subtitle: "See what others have created",
    },
    styles: {
      title: "Available Styles",
      subtitle: "Find the perfect look for your portrait",
    },
    trust: {
      title: "Your Privacy Matters",
      subtitle: "We built MemoryFrame with privacy and trust at its core",
      items: [
        {
          title: "Secure Storage",
          description: "Your photos are stored securely in our database and processed with industry-standard encryption.",
        },
        {
          title: "No AI Training",
          description: "We never use your photos to train AI models. Your faces remain yours.",
        },
        {
          title: "Secure Processing",
          description: "All data is encrypted in transit and at rest. We use industry-standard security practices.",
        },
        {
          title: "You Own the Result",
          description: "The generated portrait is yours. Use it however you like.",
        },
      ],
    },
    memoryUse: {
      title: "Memory Use",
      description: "Some moments deserve to be remembered together—even when life keeps us apart. MemoryFrame helps families create meaningful portraits that honor connection across time and distance.",
    },
    faq: {
      title: "Frequently Asked Questions",
      items: [
        {
          question: "Is MemoryFrame free?",
          answer: "MemoryFrame offers 1 free image per day. No signup required, no hidden fees, no watermarks.",
        },
        {
          question: "What photo formats are supported?",
          answer: "We accept JPG, PNG, and WebP images up to 10MB each.",
        },
        {
          question: "How long does generation take?",
          answer: "Most portraits are ready in 10-30 seconds, depending on complexity.",
        },
        {
          question: "Can I use photos of children?",
          answer: "Yes, but only if you have parental consent. Do not upload photos of minors without permission from their legal guardian.",
        },
        {
          question: "What happens to my photos?",
          answer: "Photos are processed securely and stored in our database. All data is encrypted in transit and at rest.",
        },
        {
          question: "Can I generate multiple portraits?",
          answer: "Yes, but there's a limit of 5 generations per hour to prevent abuse.",
        },
        {
          question: "What styles are available?",
          answer: "We offer styles including Classic, Painterly, Cinematic, Vintage, Black & White, and more. Each creates a unique aesthetic.",
        },
        {
          question: "Can I use the portrait commercially?",
          answer: "Yes, you own the generated image and can use it for personal or commercial purposes.",
        },
      ],
    },
  },

  create: {
    title: "Create Your Portrait",
    subtitle: "Follow the steps below to generate your family portrait",
    steps: {
      personA: {
        title: "Person A",
        description: "Upload a clear photo of the first person",
      },
      personB: {
        title: "Person B",
        description: "Upload a clear photo of the second person",
      },
      background: {
        title: "Background",
        description: "Upload or choose a background scene",
      },
      style: {
        title: "Style",
        description: "Select an artistic style for your portrait",
      },
      prompt: {
        title: "Scene Description",
        description: "Describe how you want the portrait to look",
      },
    },
    uploadGuidelines: [
      "Use clear, well-lit faces",
      "Similar angles work best",
      "Good lighting helps quality",
      "Avoid heavy filters",
    ],
    generateButton: "Generate Portrait",
    generating: {
      title: "Creating your portrait...",
      messages: [
        "Analyzing faces...",
        "Blending styles...",
        "Composing scene...",
        "Adding final touches...",
      ],
    },
    result: {
      title: "Your Portrait is Ready",
      downloadButton: "Download",
      variationsButton: "Generate Variation",
      variationLimit: "You've used your free variation. Leave a tip to unlock more.",
    },
    rateLimitError: "Daily limit reached. Try again later.",
  },


  styles: [
    {
      id: "classic",
      name: "Classic Portrait",
      description: "Timeless studio portrait style with soft lighting and neutral backgrounds.",
    },
    {
      id: "painterly",
      name: "Painterly",
      description: "Oil painting aesthetic with rich textures and artistic brushstrokes.",
    },
    {
      id: "cinematic",
      name: "Cinematic",
      description: "Movie poster quality with dramatic lighting and professional color grading.",
    },
    {
      id: "vintage",
      name: "Vintage",
      description: "Nostalgic feel with warm tones and soft focus reminiscent of old photographs.",
    },
    {
      id: "blackwhite",
      name: "Black & White",
      description: "Elegant monochrome portraits with strong contrast and timeless appeal.",
    },
    {
      id: "watercolor",
      name: "Watercolor",
      description: "Soft, flowing watercolor painting style with gentle color bleeds.",
    },
    {
      id: "pop-art",
      name: "Pop Art",
      description: "Bold colors and graphic style inspired by Andy Warhol.",
    },
    {
      id: "renaissance",
      name: "Renaissance",
      description: "Classical painting style inspired by the great masters.",
    },
  ],

  prompts: {
    categories: [
      {
        id: "christmas",
        name: "Christmas",
        prompts: [
          "Family gathered around a decorated Christmas tree, warm fireplace glow, cozy sweaters",
          "Opening presents together on Christmas morning, pajamas, excited expressions",
        ],
      },
      {
        id: "wedding",
        name: "Wedding",
        prompts: [
          "Elegant wedding reception, formal attire, soft romantic lighting",
          "Garden wedding ceremony, flowers, golden hour sunlight",
        ],
      },
      {
        id: "vintage-studio",
        name: "Vintage Studio",
        prompts: [
          "1950s studio portrait, sepia tones, classic poses, professional backdrop",
          "Old Hollywood glamour, dramatic lighting, elegant styling",
        ],
      },
      {
        id: "beach",
        name: "Beach",
        prompts: [
          "Sunset beach walk, golden light, casual summer clothes, waves in background",
          "Tropical beach vacation, palm trees, crystal clear water, relaxed poses",
        ],
      },
      {
        id: "cozy-home",
        name: "Cozy Home",
        prompts: [
          "Living room moment, reading together, warm afternoon light through windows",
          "Kitchen scene, baking cookies together, flour dust, genuine smiles",
        ],
      },
      {
        id: "cinematic",
        name: "Cinematic",
        prompts: [
          "Epic movie poster style, dramatic lighting, heroic poses, cinematic color grading",
          "Film noir aesthetic, shadows, mystery, black and white with color accents",
        ],
      },
      {
        id: "blackwhite",
        name: "Black and White",
        prompts: [
          "Timeless black and white portrait, strong contrast, emotional depth",
          "Classic monochrome family photo, professional studio lighting",
        ],
      },
      {
        id: "painterly",
        name: "Painterly",
        prompts: [
          "Oil painting style, rich colors, visible brushstrokes, museum quality",
          "Impressionist garden scene, dappled light, artistic interpretation",
        ],
      },
      {
        id: "90s-family",
        name: "90s Family Photo",
        prompts: [
          "Classic 90s family portrait, mall photo studio, laser background, bright colors",
          "Casual 90s snapshot, denim, scrunchies, disposable camera aesthetic",
        ],
      },
      {
        id: "outdoor-picnic",
        name: "Outdoor Picnic",
        prompts: [
          "Summer picnic in the park, checkered blanket, basket of food, sunny day",
          "Autumn harvest picnic, fallen leaves, warm colors, cozy atmosphere",
        ],
      },
      {
        id: "city-night",
        name: "City Night",
        prompts: [
          "Urban night scene, city lights bokeh, stylish evening wear, metropolitan vibe",
          "Rooftop at night, skyline view, romantic city atmosphere",
        ],
      },
      {
        id: "mountain-cabin",
        name: "Mountain Cabin",
        prompts: [
          "Cozy mountain cabin, fireplace, snow outside window, hot cocoa, winter warmth",
          "Rustic cabin porch, mountain view, autumn colors, peaceful retreat",
        ],
      },
    ],
  },

  seoPages: {
    aiFamilyPortrait: {
      title: "AI Family Portrait Generator | MemoryFrame",
      metaDescription: "Create beautiful AI-generated family portraits from separate photos. Bring loved ones together in one meaningful image with our free tool.",
      h1: "AI Family Portrait Generator",
      intro: "Transform separate photos into a unified family portrait using advanced AI technology. Whether you want to create a keepsake, a gift, or simply see your family together in a new way, our tool makes it simple.",
      useCases: [
        {
          title: "Long-Distance Families",
          description: "Create portraits with family members who live far away without needing everyone in the same room.",
        },
        {
          title: "Multi-Generational Photos",
          description: "Combine photos across generations to create timeless family portraits.",
        },
        {
          title: "Special Occasions",
          description: "Generate portraits for holidays, anniversaries, or family reunions.",
        },
      ],
      commonMistakes: [
        "Using blurry or low-resolution source photos",
        "Choosing photos with very different lighting conditions",
        "Not providing enough scene context in the description",
      ],
    },
    combineTwoPhotos: {
      title: "Combine Two Photos Into One Portrait | MemoryFrame",
      metaDescription: "Seamlessly merge two separate photos into one beautiful portrait. Free AI-powered photo combination tool.",
      h1: "Combine Two Photos Into One Portrait",
      intro: "Our AI technology seamlessly blends two separate photographs into a single cohesive portrait. Perfect for creating family photos, couple portraits, or bringing friends together in one frame.",
      useCases: [
        {
          title: "Couple Portraits",
          description: "Combine individual photos into a romantic couple portrait.",
        },
        {
          title: "Best Friends",
          description: "Create a fun portrait with friends who couldn't be photographed together.",
        },
        {
          title: "Pet and Owner",
          description: "Merge your photo with your pet's photo for a unique portrait.",
        },
      ],
      commonMistakes: [
        "Using photos with drastically different angles",
        "Mixing indoor and outdoor lighting sources",
        "Choosing backgrounds that don't match the subject style",
      ],
    },
    addPersonToPhoto: {
      title: "Add Person to Photo | AI Photo Editor | MemoryFrame",
      metaDescription: "Add a person to any photo using AI. Create composite images that look natural and professional. Free tool, no signup required.",
      h1: "Add Person to Photo with AI",
      intro: "Want to add someone to an existing photo? Our AI seamlessly integrates a person into your chosen background, creating natural-looking composite images that tell your story.",
      useCases: [
        {
          title: "Include Absent Family Members",
          description: "Add family members who couldn't attend an event to group photos.",
        },
        {
          title: "Create Dream Scenarios",
          description: "Place yourself or loved ones in beautiful destinations or special settings.",
        },
        {
          title: "Fix Group Photos",
          description: "Add someone who was missing from an important group shot.",
        },
      ],
      commonMistakes: [
        "Using a background with incompatible perspective",
        "Not considering lighting direction in both images",
        "Choosing a scene that doesn't match the person's attire",
      ],
    },
    familyPortraitFromTwoPhotos: {
      title: "Family Portrait From Two Photos | MemoryFrame",
      metaDescription: "Create a family portrait from just two photos. Our AI combines separate images into one cohesive family portrait. Free and easy to use.",
      h1: "Create Family Portrait From Two Photos",
      intro: "You don't need a professional photo session to get a beautiful family portrait. Upload two photos, choose a style, and let our AI create a stunning family portrait that looks like everyone was there together.",
      useCases: [
        {
          title: "New Parent Portraits",
          description: "Create family portraits with newborns using safe, separate photos.",
        },
        {
          title: "Blended Families",
          description: "Bring together family members from different households.",
        },
        {
          title: "Memory Preservation",
          description: "Create portraits that capture family connections across time.",
        },
      ],
      commonMistakes: [
        "Using photos from very different time periods (unless intentional)",
        "Ignoring scale differences between subjects",
        "Not specifying the desired pose or arrangement",
      ],
    },
    photoBackgroundReplacement: {
      title: "Photo Background Replacement | AI Background Changer | MemoryFrame",
      metaDescription: "Replace photo backgrounds instantly with AI. Transform any portrait with beautiful new backgrounds. Free online tool.",
      h1: "AI Photo Background Replacement",
      intro: "Transform your portraits by replacing backgrounds with AI. Whether you want a studio look, outdoor scenery, or artistic setting, our tool makes background changes seamless and professional.",
      useCases: [
        {
          title: "Professional Headshots",
          description: "Turn casual photos into professional portraits with clean backgrounds.",
        },
        {
          title: "Travel Photos",
          description: "Place yourself in dream destinations without leaving home.",
        },
        {
          title: "Creative Portraits",
          description: "Use artistic or fantasy backgrounds for unique creative projects.",
        },
      ],
      commonMistakes: [
        "Choosing backgrounds with mismatched lighting",
        "Using busy backgrounds that distract from subjects",
        "Not considering the original photo's perspective",
      ],
    },
    promptsPage: {
      title: "Portrait Prompts & Ideas | MemoryFrame",
      metaDescription: "Browse our collection of AI portrait prompts. Get inspiration for family portraits, couple photos, and more. Copy and use for free.",
      h1: "Portrait Prompts & Scene Ideas",
      intro: "Need inspiration for your family portrait? Browse our curated collection of prompts organized by theme. Click any prompt to copy it, or use them as a starting point for your own ideas.",
    },
    stylesPage: {
      title: "Portrait Styles | MemoryFrame",
      metaDescription: "Explore all available portrait styles: Classic, Painterly, Cinematic, Vintage, and more. See examples and choose the perfect style for your family portrait.",
      h1: "Portrait Styles",
      intro: "Choose from a variety of artistic styles to give your family portrait the perfect look. Each style creates a unique aesthetic, from timeless classics to bold artistic interpretations.",
    },
  },

  legal: {
    owner: {
      name: "SIMONCINI DIEGO",
      address: "Italy",
      email: "reservationwebbitz@gmail.com",
    },
    privacy: {
      title: "Privacy Policy",
      lastUpdated: "December 27, 2024",
      sections: [
        {
          title: "1. Data Controller",
          content: "The Data Controller is SIMONCINI DIEGO, contactable at reservationwebbitz@gmail.com. This Privacy Policy explains how we handle your data when you use MemoryFrame.",
        },
        {
          title: "2. Data We Collect",
          content: "MemoryFrame is designed with privacy-first principles. Photos you upload are stored securely in our database and transmitted to OpenAI's API for processing. We use your photos solely for generating your requested portrait. All data is encrypted in transit and at rest.",
        },
        {
          title: "3. How Your Photos Are Processed",
          content: "When you upload photos, they are stored securely in our database and sent via API to OpenAI for image generation. OpenAI processes the images according to their own privacy policy and data handling practices. We recommend reviewing OpenAI's privacy policy for details on their data processing.",
        },
        {
          title: "4. Data Storage",
          content: "Photos you upload are stored securely in our database. We collect minimal personal information necessary for service operation. We use cookies for essential functionality and analytics. Generated images are stored and can be accessed through your account.",
        },
        {
          title: "5. Third-Party Services",
          content: "We use OpenAI's API for image generation. Your photos are transmitted to OpenAI for processing. We use Vercel for hosting and Stripe for tip processing. We do not sell, share, or transfer your data to advertisers or data brokers.",
        },
        {
          title: "6. Analytics",
          content: "We may collect anonymous, aggregate usage statistics (such as page views and feature usage) to improve the service. This data cannot be used to identify individual users.",
        },
        {
          title: "7. Your Rights Under GDPR",
          content: "As an EU resident, you have rights including: access to your data, rectification, erasure, restriction of processing, data portability, and objection to processing. You can exercise these rights by contacting us at reservationwebbitz@gmail.com. We will respond to your request within 30 days.",
        },
        {
          title: "8. Children's Privacy",
          content: "Our service is not directed to children under 16. If you upload photos of minors, you must be their parent or legal guardian, or have explicit consent from their parent or legal guardian.",
        },
        {
          title: "9. Security Measures",
          content: "All data transmissions are encrypted using TLS/SSL. We use industry-standard security practices to protect your data. All stored data is encrypted at rest and access is restricted to authorized personnel only.",
        },
        {
          title: "10. Changes to This Policy",
          content: "We may update this Privacy Policy from time to time. The 'Last Updated' date at the top indicates when changes were made. Continued use of the service after changes constitutes acceptance.",
        },
        {
          title: "11. Contact",
          content: "For privacy-related questions or requests, contact: SIMONCINI DIEGO at reservationwebbitz@gmail.com.",
        },
      ],
    },
    terms: {
      title: "Terms of Service",
      lastUpdated: "December 27, 2024",
      sections: [
        {
          title: "1. Service Provider",
          content: "MemoryFrame is operated by SIMONCINI DIEGO (hereinafter 'Provider', 'we', 'us'). By using this service, you agree to these Terms of Service.",
        },
        {
          title: "2. Service Description",
          content: "MemoryFrame is an AI-powered tool that generates family portraits from uploaded photos. The service uses OpenAI's image generation technology via API calls. Photos are stored securely in our database for processing and service operation.",
        },
        {
          title: "3. Free Service & Voluntary Tips",
          content: "The service offers 1 free image per day. Users may purchase additional credits to generate more images. Credits are non-refundable and do not provide any additional features or guarantees beyond image generation.",
        },
        {
          title: "4. Acceptable Use",
          content: "You agree to: (a) Only upload photos you have the right to use; (b) Not upload illegal, harmful, or offensive content; (c) Not use the service to create deepfakes or misleading content; (d) Not attempt to circumvent rate limits or abuse the service; (e) Comply with all applicable laws and regulations.",
        },
        {
          title: "5. Photos of Minors",
          content: "You may only upload photos of minors if you are their parent or legal guardian, or have explicit written consent from their parent or legal guardian. You assume full responsibility for compliance with this requirement.",
        },
        {
          title: "6. Intellectual Property",
          content: "You retain all rights to the photos you upload. The generated portraits are yours to use for personal or commercial purposes without restriction. The MemoryFrame name, logo, and website design remain the property of the Provider.",
        },
        {
          title: "7. Data Storage",
          content: "Photos you upload are stored securely in our database. All data is encrypted in transit and at rest. We use industry-standard security practices to protect your data. You can request deletion of your data at any time by contacting us.",
        },
        {
          title: "8. Service Limitations",
          content: "We impose rate limits (5 generations per hour) to prevent abuse and ensure fair access. We reserve the right to modify, suspend, or terminate the service at any time without notice. Service availability is not guaranteed.",
        },
        {
          title: "9. Disclaimer of Warranties",
          content: "THE SERVICE IS PROVIDED 'AS IS' WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. We do not guarantee: (a) Uninterrupted or error-free operation; (b) Specific quality or accuracy of generated images; (c) Availability at any particular time; (d) Results meeting your expectations.",
        },
        {
          title: "10. Limitation of Liability",
          content: "TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE PROVIDER SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR USE OF THE SERVICE.",
        },
        {
          title: "11. Indemnification",
          content: "You agree to indemnify and hold harmless the Provider from any claims, damages, or expenses arising from your use of the service or violation of these terms.",
        },
        {
          title: "12. Governing Law",
          content: "These Terms shall be governed by and construed in accordance with the laws of Italy. Any disputes shall be subject to the exclusive jurisdiction of the courts of Italy.",
        },
        {
          title: "13. Severability",
          content: "If any provision of these Terms is found to be unenforceable, the remaining provisions shall continue in full force and effect.",
        },
        {
          title: "14. Changes to Terms",
          content: "We reserve the right to modify these Terms at any time. Changes will be effective upon posting. Continued use of the service constitutes acceptance of modified Terms.",
        },
        {
          title: "15. Contact",
          content: "For questions about these Terms of Service, contact: SIMONCINI DIEGO at reservationwebbitz@gmail.com.",
        },
      ],
    },
    contact: {
      title: "Contact Us",
      intro: "We'd love to hear from you. Whether you have questions, feedback, or need support, reach out through the channel below.",
      email: "reservationwebbitz@gmail.com",
      privacyEmail: "reservationwebbitz@gmail.com",
      responseTime: "We typically respond within 24-48 hours.",
    },
  },

  footer: {
    tagline: "Create meaningful family portraits with AI",
    copyright: "© 2024 MemoryFrame. All rights reserved.",
    legalEntity: "SIMONCINI DIEGO",
    legalAddress: "Italy • reservationwebbitz@gmail.com",
    links: {
      product: [
        { label: "Create Portrait", href: "/create" },
        { label: "Styles", href: "/styles" },
        { label: "Prompts", href: "/prompts" },
      ],
      learn: [
        { label: "AI Family Portrait", href: "/ai-family-portrait" },
        { label: "Combine Two Photos", href: "/combine-two-photos" },
        { label: "Add Person to Photo", href: "/add-person-to-photo" },
        { label: "Merge Photos AI", href: "/merge-photos-ai" },
        { label: "Portrait AI Generator", href: "/portrait-ai-generator" },
        { label: "Paint by Numbers from Photo", href: "/paint-by-numbers-from-photo" },
      ],
      legal: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Contact", href: "/contact" },
      ],
    },
    privacyNote: "Your photos are stored securely in our database. All data is encrypted in transit and at rest - your privacy is protected.",
  },

  navbar: {
    links: [
      { label: "Home", href: "/" },
      { label: "Paint by Numbers", href: "/paint-by-numbers-from-photo" },
      { label: "Styles", href: "/styles" },
      { label: "Prompts", href: "/prompts" },
    ],
    ctaLabel: "Create Portrait",
  },

  errors: {
    uploadFailed: "Failed to upload file. Please try again.",
    fileTooLarge: "File is too large. Maximum size is 10MB.",
    invalidFormat: "Invalid file format. Please use JPG, PNG, or WebP.",
    generationFailed: "Failed to generate portrait. Please try again.",
    rateLimitExceeded: "Daily limit reached. Try again later.",
    networkError: "Network error. Please check your connection.",
  },
} as const;

export type Copy = typeof copy;

