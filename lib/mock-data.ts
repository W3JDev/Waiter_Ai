import type { Restaurant, MenuCategory, MenuItem, MenuTranslation, AIConfig } from "@/types"

// Mock Restaurant Data
export const mockRestaurant: Restaurant = {
  id: "67e5935b23a0f201833a3012",
  name: "Table & Apron",
  description:
    "Experience the perfect blend of international flavors and local ingredients at our award-winning restaurant.",
  logo_url:
    "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a27616_1000162901.png",
  banner_url:
    "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/b38e73_1000162902.jpg",
  address: "23, Jalan SS 20/11, Damansara Kim, 47400 Petaling Jaya, Selangor",
  phone: "+60 0377334000",
  operating_hours: [
    {
      day: "monday",
      closed: true,
      shifts: [],
    },
    {
      day: "tuesday",
      closed: false,
      shifts: [
        {
          open: "11:30",
          close: "22:30",
        },
      ],
    },
    {
      day: "wednesday",
      closed: false,
      shifts: [
        {
          open: "11:30",
          close: "22:00",
        },
      ],
    },
    {
      day: "thursday",
      closed: false,
      shifts: [
        {
          open: "11:30",
          close: "22:30",
        },
      ],
    },
    {
      day: "friday",
      closed: false,
      shifts: [
        {
          open: "11:30",
          close: "22:30",
        },
      ],
    },
    {
      day: "saturday",
      closed: false,
      shifts: [
        {
          open: "11:30",
          close: "22:30",
        },
      ],
    },
    {
      day: "sunday",
      closed: false,
      shifts: [
        {
          open: "11:30",
          close: "22:30",
        },
      ],
    },
  ],
  businessHours: {
    monday: { open: "00:00", close: "00:00" }, // Closed
    tuesday: { open: "11:30", close: "22:30" },
    wednesday: { open: "11:30", close: "22:00" },
    thursday: { open: "11:30", close: "22:30" },
    friday: { open: "11:30", close: "22:30" },
    saturday: { open: "11:30", close: "22:30" },
    sunday: { open: "11:30", close: "22:30" },
  },
  whatsapp_link: "https://wa.me/600377334000",
  booking_link: "https://reservation.umai.io/en/widget/table-apron",
  map_link: "https://maps.app.goo.gl/wsYqjXthNEHbsiEe6",
  created_date: "2025-03-27T18:05:15.088000",
  updated_date: "2025-03-31T09:57:15.464000",
  created_by: "mnjewelps@gmail.com",
}

// Mock Menu Categories
export const mockCategories: MenuCategory[] = [
  {
    id: "67e93c307103ca2e355b16e1",
    name: "Sparkling",
    image_url: "https://images.unsplash.com/photo-1544145945-f90425340c7e",
  },
  {
    id: "67e93c307103ca2e355b16e2",
    name: "Starters",
    image_url: "https://images.unsplash.com/photo-1546241072-48010ad2862c",
  },
  {
    id: "67e93c307103ca2e355b16e3",
    name: "Mains",
    image_url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
  },
  {
    id: "67e93c307103ca2e355b16e4",
    name: "Desserts",
    image_url: "https://images.unsplash.com/photo-1551024601-bec78aea704b",
  },
  {
    id: "67e93c307103ca2e355b16e5",
    name: "Drinks",
    image_url: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a",
  },
]

// Mock Menu Items
export const mockMenuItems: MenuItem[] = [
  {
    id: "67e93c307103ca2e355b1702",
    name: "Mango Passion Fizz",
    description: "Mango Juice, Passionfruit Syrup, Lime Juice, Calamansi Lime Juice, Passionfruit Pulp, Mint Leaf",
    price: 15,
    category_id: "67e93c307103ca2e355b16e5", // Drinks category
    image_url: "https://images.unsplash.com/photo-1638176067000-9e2a3c1a0a03",
    allergens: ["sugar"],
    available: true,
    dietary_info: [],
    featured: false,
  },
  {
    id: "67e93c307103ca2e355b1703",
    name: "Buckwheat Fried Chicken",
    description: "Our signature dish - crispy fried chicken with a buckwheat coating. Served with house-made sauce.",
    price: 27,
    category_id: "67e93c307103ca2e355b16e2", // Starters category
    image_url: "https://images.unsplash.com/photo-1562967914-608f82629710",
    allergens: ["gluten", "eggs"],
    available: true,
    dietary_info: [],
    spice_level: "mild",
    featured: true,
  },
  {
    id: "67e93c307103ca2e355b1704",
    name: "Pork Ribs with Pineapple Glaze",
    description: "Tender pork ribs slow-cooked and glazed with our sweet-tangy pineapple sauce.",
    price: 45,
    category_id: "67e93c307103ca2e355b16e3", // Mains category
    image_url: "https://images.unsplash.com/photo-1544025162-d76694265947",
    allergens: [],
    available: true,
    dietary_info: [],
    spice_level: "mild",
    featured: true,
  },
  {
    id: "67e93c307103ca2e355b1705",
    name: "Pork Chop with Watercress Salad",
    description: "Juicy pork chop served with fresh watercress salad and house dressing.",
    price: 38,
    category_id: "67e93c307103ca2e355b16e3", // Mains category
    image_url: "https://images.unsplash.com/photo-1432139555190-58524dae6a55",
    allergens: [],
    available: true,
    dietary_info: [],
    featured: false,
  },
  {
    id: "67e93c307103ca2e355b1706",
    name: "Whole Roast Tilapia with Harissa",
    description: "Fresh tilapia roasted whole with North African harissa spices.",
    price: 52,
    category_id: "67e93c307103ca2e355b16e3", // Mains category
    image_url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2",
    allergens: ["fish"],
    available: true,
    dietary_info: [],
    spice_level: "medium",
    featured: true,
  },
  {
    id: "67e93c307103ca2e355b1707",
    name: "Tiramisu",
    description: "Classic Italian dessert with layers of coffee-soaked ladyfingers and mascarpone cream.",
    price: 18,
    category_id: "67e93c307103ca2e355b16e4", // Desserts category
    image_url: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9",
    allergens: ["dairy", "eggs", "gluten"],
    available: true,
    dietary_info: ["vegetarian"],
    featured: true,
  },
  {
    id: "67e93c307103ca2e355b1708",
    name: "Non-Alcoholic Prosecco",
    description: "Alcohol-free sparkling wine with notes of green apple and peach.",
    price: 22,
    category_id: "67e93c307103ca2e355b16e1", // Sparkling category
    image_url: "https://images.unsplash.com/photo-1605270012917-bf357a1fae9e",
    allergens: [],
    available: true,
    dietary_info: ["vegan", "alcohol-free"],
    featured: false,
  },
]

// Mock Translations
export const mockTranslations: Record<string, MenuTranslation[]> = {
  "67e93c307103ca2e355b1702": [
    {
      id: "trans1",
      item_id: "67e93c307103ca2e355b1702",
      language_code: "zh",
      translated_name: "芒果百香果气泡饮",
      translated_description: "芒果汁，百香果糖浆，青柠汁，金桔青柠汁，百香果果肉，薄荷叶",
    },
    {
      id: "trans2",
      item_id: "67e93c307103ca2e355b1702",
      language_code: "ms",
      translated_name: "Fizz Mangga Markisa",
      translated_description: "Jus Mangga, Sirap Markisa, Jus Limau, Jus Limau Calamansi, Pulpa Markisa, Daun Pudina",
    },
  ],
  "67e93c307103ca2e355b1703": [
    {
      id: "trans3",
      item_id: "67e93c307103ca2e355b1703",
      language_code: "zh",
      translated_name: "荞麦炸鸡",
      translated_description: "我们的招牌菜 - 外皮酥脆的荞麦炸鸡。配自制酱料。",
    },
  ],
}

// Mock AI Config
export const mockAIConfig: AIConfig = {
  id: "67e5937d23a0f201833a301d",
  restaurant_id: "67e5935b23a0f201833a3012",
  provider: "groq",
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
  max_tokens: 300,
  prompt_template: "Generate a detailed and appealing description for a menu item called {{name}}. If any of the following information is available, incorporate it into the description: {{dietary_info}}, {{allergens}}, {{spice_level}}. Make it sound enticing and descriptive, between 100-150 characters.",
}

// Mock API response for AI generation
export const mockAIResponse =
  "Hello! Our Buckwheat Fried Chicken is our signature dish that's been on the menu for 10 years. It's crispy on the outside, juicy on the inside, and served with our house-made sauce. Price: RM27 for 3 pieces or RM51 for 6 pieces. Contains: gluten, eggs. Would you like to know about any of our other signature dishes?"

