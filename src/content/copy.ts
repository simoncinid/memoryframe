export const copy = {
  brand: {
    name: "MemoryFrame",
    tagline: "Create meaningful family portraits with AI",
    domain: "memoryframe.com",
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
          title: "Photos Deleted",
          description: "Your uploads are automatically deleted within 24 hours. You can also delete them immediately after generation.",
        },
        {
          title: "No AI Training",
          description: "We never use your photos to train AI models. Your faces remain yours.",
        },
        {
          title: "Secure Processing",
          description: "All data is encrypted in transit and at rest. We process and forget.",
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
          question: "Is MemoryFrame really free?",
          answer: "Yes, the basic service is completely free. You can optionally leave a tip if the tool helped you.",
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
          answer: "Photos are processed securely and deleted within 24 hours by default. You can choose to delete them immediately after generation.",
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
    deleteOption: {
      label: "Delete photos immediately after generation",
      description: "Photos will be removed right after your portrait is created",
    },
    rateLimitError: "Daily limit reached. Try again later.",
  },

  tipModal: {
    title: "Support This Free Tool",
    subtitle: "If it helped you, leave what feels right",
    amounts: [3, 7, 15, 29],
    otherLabel: "Other",
    checkoutButton: "Checkout",
    thankYou: {
      title: "Thank You!",
      message: "Your support helps keep MemoryFrame free for everyone.",
      closeButton: "Close",
    },
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
      intro: "Transform separate photos into a unified family portrait using advanced AI technology. Whether you want to create a keepsake, a gift, or simply see your family together in a new way, our tool makes it simple and free.",
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
    privacy: {
      title: "Privacy Policy",
      lastUpdated: "December 2024",
      sections: [
        {
          title: "What We Collect",
          content: "We collect only what's necessary to provide the service: the photos you upload, your style and prompt choices, and basic usage data (page views, feature usage). We do not require account creation or personal information.",
        },
        {
          title: "How We Use Your Data",
          content: "Photos are used solely to generate your portrait. We do not use your photos to train AI models. Usage data helps us improve the service and fix issues.",
        },
        {
          title: "Data Retention",
          content: "Uploaded photos are automatically deleted within 24 hours by default. You can choose to delete them immediately after generation. Generated portraits are available for download but not stored permanently on our servers.",
        },
        {
          title: "Data Security",
          content: "All data is encrypted in transit using TLS. Photos are processed in isolated environments and not accessible to our team.",
        },
        {
          title: "Third Parties",
          content: "We use cloud infrastructure providers to process and store data temporarily. We do not sell or share your data with advertisers or data brokers.",
        },
        {
          title: "Your Rights",
          content: "You can request deletion of any data associated with your session. Contact us at privacy@memoryframe.com.",
        },
        {
          title: "Cookies",
          content: "We use essential cookies for site functionality and anonymous analytics to understand usage patterns. No advertising cookies.",
        },
      ],
    },
    terms: {
      title: "Terms of Service",
      lastUpdated: "December 2024",
      sections: [
        {
          title: "Service Description",
          content: "MemoryFrame provides an AI-powered tool to generate family portraits from uploaded photos. The service is provided free of charge, with optional tipping.",
        },
        {
          title: "Acceptable Use",
          content: "You may use MemoryFrame for personal and commercial purposes. You must have the right to use any photos you upload. You must not upload illegal content, deepfakes intended to deceive, or content that violates others' rights.",
        },
        {
          title: "Photos of Minors",
          content: "You may only upload photos of minors if you are their parent or legal guardian, or have explicit permission from their parent or legal guardian.",
        },
        {
          title: "Content Ownership",
          content: "You retain ownership of photos you upload. You own the generated portraits and may use them freely. By uploading, you grant us a temporary license to process the images.",
        },
        {
          title: "Service Limitations",
          content: "We limit generations to 5 per hour per user to prevent abuse. We reserve the right to refuse service for violations of these terms.",
        },
        {
          title: "No Warranty",
          content: "The service is provided 'as is' without warranties. Results may vary based on input quality and complexity.",
        },
        {
          title: "Tips and Payments",
          content: "Tips are voluntary and non-refundable. They help support continued development of the free service.",
        },
        {
          title: "Changes to Terms",
          content: "We may update these terms. Continued use after changes constitutes acceptance.",
        },
      ],
    },
    contact: {
      title: "Contact Us",
      intro: "We'd love to hear from you. Whether you have questions, feedback, or need support, reach out through any of the channels below.",
      email: "hello@memoryframe.com",
      privacyEmail: "privacy@memoryframe.com",
      responseTime: "We typically respond within 24-48 hours.",
    },
  },

  footer: {
    tagline: "Create meaningful family portraits with AI",
    copyright: "© 2024 MemoryFrame. All rights reserved.",
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
      ],
      legal: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Contact", href: "/contact" },
      ],
    },
    privacyNote: "Your photos are never used for AI training and are deleted within 24 hours.",
  },

  navbar: {
    links: [
      { label: "Home", href: "/" },
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

